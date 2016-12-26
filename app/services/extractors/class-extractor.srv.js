import Extractor from './extractor.srv';

/**
 * @Name ClassExtractor
 * @extends Extractor
 */
class ClassExtractor extends Extractor {

  /**
   * Create a new ClassExtractor.
   * @param {Storage} Storage
   * @param {$http} $http
   * @param {$q} $q
   * @param {$log} $log
   * @param {PREFIX} PREFIX
   * @param {CLASS_BLACKLIST} CLASS_BLACKLIST
   * @param {RequestConfig} RequestConfig
   * @param {QueryFactory} QueryFactory
   * @param {Nodes} Nodes
   * @param {Promises} Promises
   *
   * @ngInject
   */
  constructor (Storage, $http, $q, $log, PREFIX, CLASS_BLACKLIST, RequestConfig, QueryFactory, Nodes, Promises) {

    // call constructor of Extractor
    super();
    
    // set up attributes
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
    this.reqConfig = RequestConfig;
    this.queryFactory = QueryFactory;
    this.nodes = Nodes;
    this.promises = Promises;

    let blacklistStr = Storage.getItem('class_blacklist');

    if (blacklistStr !== undefined && blacklistStr !== null) {
      // use last blacklist
      let classInput = blacklistStr.replace(/(\r\n|\n|\r|\s)/gm,'');
      this.setBlacklist(classInput.split(','));
    } else {
      // set up new blacklists
      for (let type in CLASS_BLACKLIST) {
        if (CLASS_BLACKLIST.hasOwnProperty(type) && type !== 'SKOS') {
          for (let i = 0; i < CLASS_BLACKLIST[type].length; i++) {
            this.blacklist.push(PREFIX[type] + CLASS_BLACKLIST[type][i]);
          }
        }
      }
    }
  } // end of constructor()

  requestClasses() {
    const deferred = this.$q.defer();
    const promiseId = this.promises.addPromise(deferred);

    // do not request further classes
    if (this.nodes.hasClassNodes()) {
      this.$log.debug('[Classes] Skip loading further classes...');
      deferred.resolve([]);
      return deferred.promise;
    }

    let classIds = [];

    let limit = this.reqConfig.getLimit() || 10;

    const self = this;

    function doQuery(lastTry = false, offset = 0, limit = 10) {
      let requestURL = self.reqConfig.getRequestURL();
      let query = self.queryFactory.getClassQuery(limit, offset);

      self.$log.debug(`[Classes] Send Request with offset ${offset}...`);
      self.$http.get(requestURL, self.reqConfig.forQuery(query, deferred))
        .then(function handleExtractedClasses(response) {
          if (response.data.results !== undefined) {
            let bindings = response.data.results.bindings;

            if (bindings !== undefined) {

              // endpoint may ignore limit
              bindings = bindings.slice(0, Math.min(bindings.length, limit * 2));

              let fetchMore = 0;

              bindings.forEach((binding) => {
                let currentClassURI = binding.class.value;

                if (currentClassURI.match(/^http.*/) && !self.inBlacklist(currentClassURI) &&
                    binding.instanceCount !== undefined) {
                  let node = {};

                  node.uri = currentClassURI;
                  node.name = (binding.label !== undefined) ? binding.label.value : '';
                  node.value = parseInt(binding.instanceCount.value);
                  node.type = 'class';
                  node.active = false;
                  const newClassId = self.nodes.addNode(node);

                  classIds.push(newClassId);

                  if (binding.class !== undefined && binding.class.value !== undefined) {
                    self.requestClassLabel(newClassId, currentClassURI);
                  }
                } else {
                  self.$log.debug(`[Classes] Class '${currentClassURI}' is either blacklisted or has an invalid URI!`);
                  fetchMore++;
                }
              });

              if (fetchMore === 0) {
                deferred.resolve(classIds);
              } else {
                self.$log.debug(`[Classes] Fetch ${fetchMore} more classes!`);
                doQuery(false, offset + limit, fetchMore);
              }
            } else {
              self.$log.debug('[Classes] No further classes found!');
              deferred.resolve(classIds);
            }
          } else {
            self.$log.error(response);
            if (!lastTry) {
              // switch sparql format and try again
              self.$log.warn('[Classes] Okay please, just let me try one more time!');
              self.reqConfig.switchFormat();
              doQuery(true);
            } else {
              // switch back and surrender
              self.reqConfig.switchFormat();
              self.$log.error('[Classes] Okay, I surrender...');
              deferred.resolve(classIds);
            }
          }
        }, function handleErrorExtractingClasses(err) {
          if (err.config.timeout.$$state.value === 'canceled') {
            self.$log.warn('[Class Extractor] Class extraction was canceled!');
            deferred.reject(classIds);
          } else {
            if (!self.reqConfig.getUseProxy()) {
              self.$log.warn('[Class Extractor] Might need a proxy here, try again...');
              self.reqConfig.setUseProxy(true);
              doQuery(false, 0, limit);
            } else {
              deferred.reject(classIds);
            }
          }
        })
        .finally(function () {
          self.promises.removePromise(promiseId);
        });
    } // end of doQuery()

    doQuery(false, 0, limit);

    return deferred.promise;
  }

  requestClassLabel (classId, classURI) {
    const self = this;

    const canceller = self.$q.defer();
    const promiseId = self.promises.addPromise(canceller);

    const labelLang = this.reqConfig.getLabelLanguage();
    const labelQuery = this.queryFactory.getLabelQuery(classURI, labelLang);
    const requestURL = this.reqConfig.getRequestURL();

    self.$log.debug(`[Class Label] Send request for '${classURI}'...`);

    this.$http.get(requestURL, this.reqConfig.forQuery(labelQuery, canceller))
      .then(function handleExtractedClassLabel(response) {
        if (response === undefined || response.data === undefined || response.data.results === undefined) {
          return;
        }

        const bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0 && bindings[0].label !== undefined &&
            bindings[0].label.value !== '') {
          const label = bindings[0].label.value;
          self.nodes.insertLabel(classId, label);
          self.$log.debug(`[Class Label] Found '${label}' for '${classURI}'.`);
        } else {
          self.$log.debug(`[Class Label] Found None for '${classURI}'.`);
          self.requestClassSkosLabel(classId, classURI);
        }
      }, function handleErrorExtractingClassLabel(err) {
        if (err.status !== undefined && err.status === 400) {
          if (typeof err.data === 'string' && err.data.indexOf(`syntax error at 'SAMPLE'`) !== -1) {
            self.$log.warn(`[Class Extractor] Endpoint does not understand query with 'SAMPLE'!`);
          } else {
            self.$log.error('[Class Extractor] Endpoint returned bad request on retrieving class labels');
            self.$log.error(err);
          }
        } else {
          self.$log.error(err);
        }
      })
      .finally(function () {
        self.promises.removePromise(promiseId);
      });
  } // end of requestClassLabel()

  /**
   * If rdfs label can not be found, maybe there is an skos:prefLabel.
   *
   * @param {string} classId - the id of the class which label should be found
   * @param {string} classURI - the URI of this class
   */
  requestClassSkosLabel (classId, classURI) {
    const self = this;

    const canceller = this.$q.defer();

    const labelLang = this.reqConfig.getLabelLanguage();
    const skosLabelQuery = this.queryFactory.getPreferredLabelQuery(classURI, labelLang);
    const requestURL = this.reqConfig.getRequestURL();

    self.$log.debug(`[Class Label] Send request for '${classURI}' SKOS preferred label...`);

    this.$http.get(requestURL, this.reqConfig.forQuery(skosLabelQuery, canceller))
      .then(function handleExtractedSkosLabel(response) {
        if (response === undefined || response.data === undefined || response.data.results === undefined) {
          return;
        }

        const bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0 && bindings.label !== undefined &&
            bindings[0].label.value !== '') {
          const label = bindings[0].label.value;
          self.nodes.insertLabel(classId, label);
          self.$log.debug(`[Class Label] Found SKOS preferred label '${label}' for '${classURI}'.`);
        } else {
          self.$log.debug(`[Class Label] Found no SKOS preferred label for '${classURI}'.`);
        }
      }, function (err) {
        self.$log.error(err);
      });
  } // end of requestClassSkosLabel()
} // end of class 'ClassExtractor'

export default ClassExtractor;
