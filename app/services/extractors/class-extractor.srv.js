'use strict';

import Extractor from './extractor.srv';

/**
 * @Name ClassExtractor
 * @extends Extractor
 */
class ClassExtractor extends Extractor {

  /**
   * Create a new ClassExtractor.
   *
   * @param $http
   * @param $q
   * @param $log
   * @param PREFIX
   * @param CLASS_BLACKLIST
   * @param RequestConfig
   * @param QueryFactory
   * @param Nodes
   * @param Promises
   */
  constructor ($http, $q, $log, PREFIX, CLASS_BLACKLIST, RequestConfig, QueryFactory, Nodes, Promises) {

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

    // set up blacklists
    for (var type in CLASS_BLACKLIST) {
      if (CLASS_BLACKLIST.hasOwnProperty(type)) {
        for (var i = 0; i < CLASS_BLACKLIST[type].length; i++) {
          this.blacklist.push(PREFIX[type] + CLASS_BLACKLIST[type][i]);
        }
      }
    }
  } // end of constructor()

  requestClasses() {
    var self = this;

    var deferred = this.$q.defer();
    const promiseId = self.promises.addPromise(deferred);

    // do not request further classes
    if (this.nodes.hasClassNodes()) {
      self.$log.debug('[Classes] Skip loading further classes...');
      deferred.resolve([]);
      return deferred.promise;
    }

    self.classIds = [];

    let limit = this.reqConfig.getLimit() || 10;

    var requestURL = this.reqConfig.getRequestURL();

    function doQuery(lastTry = false, offset = 0, limit = 10) {

      let query = self.queryFactory.getClassQuery(limit, offset);

      self.$log.log(`[Classes] Send Request with offset ${offset}...`);
      self.$http.get(requestURL, self.reqConfig.forQuery(query, deferred))
        .then(function (response) {
          if (response.data.results !== undefined) {
            var bindings = response.data.results.bindings;

            if (bindings !== undefined) {

              // endpoint may ignore limit
              bindings = bindings.slice(0, Math.min(bindings.length, limit*2));

              let fetchMore = 0;

              for (let i = 0; i < bindings.length; i++) {

                var currentClassURI = bindings[i].class.value;

                if (!self.inBlacklist(currentClassURI) && bindings[i].instanceCount !== undefined) {
                  var node = {};

                  node.uri = currentClassURI;
                  node.name = (bindings[i].label !== undefined) ? bindings[i].label.value : '';
                  node.value = parseInt(bindings[i].instanceCount.value);
                  node.type = 'class';
                  node.active = false;
                  var newClassId = self.nodes.addNode(node);

                  self.classIds.push(newClassId);

                  if (bindings[i].class !== undefined && bindings[i].class.value !== undefined) {
                    self.requestClassLabel(newClassId, currentClassURI);
                  }
                } else {
                  self.$log.debug(`[Classes] Class '${currentClassURI} is blacklisted!`);
                  fetchMore++;
                }
              }

              if (fetchMore === 0) {
                deferred.resolve(self.classIds);
              } else {
                self.$log.debug(`[Classes] Fetch ${fetchMore} more classes!`);
                doQuery(false, offset + limit, fetchMore);
              }
            } else {
              self.$log.debug('[Classes] No further classes found!');
              deferred.resolve(self.classIds);
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
              deferred.resolve(self.classIds);
            }
          }
        }, function (err) {
          self.$log.error(err);
          deferred.reject(self.classIds);
        })
        .finally(function () {
          self.promises.removePromise(promiseId);
        });
    } // end of doQuery()

    doQuery(false, 0,limit);

    return deferred.promise;
  }

  requestClassLabel (classId, classURI) {
    var self = this;

    var canceller = self.$q.defer();
    const promiseId = self.promises.addPromise(canceller);

    var labelLang = this.reqConfig.getLabelLanguage();
    var labelQuery = this.queryFactory.getLabelQuery(classURI, labelLang);
    var requestURL = this.reqConfig.getRequestURL();

    self.$log.debug(`[Class Label] Send request for '${classURI}'...`);

    this.$http.get(requestURL, this.reqConfig.forQuery(labelQuery, canceller))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0 && bindings[0].label !== undefined &&
            bindings[0].label.value !== '') {
          var label = bindings[0].label.value;
          self.nodes.insertLabel(classId, label);
          self.$log.debug(`[Class Label] Found '${label}' for '${classURI}'.`);
        } else {
          self.$log.debug(`[Class Label] Found None for '${classURI}'.`);
          self.requestClassSkosLabel(classId, classURI);
        }
      },function (err) {
        self.$log.error(err);
      })
      .finally(function () {
        self.promises.removePromise(promiseId);
      });
  } // end of requestClassLabel()

  /**
   * If rdfs label can not be found, maybe there is an skos:prefLabel.
   *
   * @param classId - the id of the class which label should be found
   * @param classURI - the URI of this class
   */
  requestClassSkosLabel (classId, classURI) {
    var self = this;

    var canceller = this.$q.defer();

    var labelLang = this.reqConfig.getLabelLanguage();
    var skosLabelQuery = this.queryFactory.getPreferredLabelQuery(classURI, labelLang);
    var requestURL = this.reqConfig.getRequestURL();

    self.$log.debug(`[Class Label] Send request for '${classURI}' SKOS preferred label...`);

    this.$http.get(requestURL, this.reqConfig.forQuery(skosLabelQuery, canceller))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0 && bindings.label !== undefined &&
            bindings[0].label.value !== '') {
          var label = bindings[0].label.value;
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

ClassExtractor.$inject = [
  '$http', '$q', '$log', 'PREFIX', 'CLASS_BLACKLIST', 'RequestConfig', 'QueryFactory', 'Nodes', 'Promises'
];

export default ClassExtractor;
