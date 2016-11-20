import Extractor from './extractor.srv';

/**
 * @ngdoc service
 * @name RelationExtractor
 * @extends Extractor
 */
class RelationExtractor extends Extractor {
  
  /**
   * Creates a RelationExtractor.
   *
   * @param {$cookies} $cookies
   * @param {$http} $http
   * @param {$q} $q
   * @param {$log} $log
   * @param {PREFIX} PREFIX
   * @param {PROPERTY_BLACKLIST} PROPERTY_BLACKLIST
   * @param {QueryFactory} QueryFactory
   * @param {RequestConfig} RequestConfig
   * @param {Nodes} Nodes
   * @param {Properties} Properties
   * @param {Promises} Promises
   *
   * @ngInject
   */
  constructor($cookies, $http, $q, $log, PREFIX, PROPERTY_BLACKLIST, QueryFactory, RequestConfig, Nodes, Properties,
              Promises) {

    // call constructor of super class Extractor
    super();

    this.blacklist = [];
    this.$cookies = $cookies;
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
    this.queryFactory = QueryFactory;
    this.rConfig = RequestConfig;
    this.nodes = Nodes;
    this.props = Properties;
    this.promises = Promises;
    
    let blacklistStr = $cookies.get('ldvowl_property_blacklist');
    
    if (typeof blacklistStr !== 'undefined') {
      // use last blacklist
      let classInput = blacklistStr.replace(/(\r\n|\n|\r|\s)/gm,'');
      this.setBlacklist(classInput.split(','));
    } else {
      // create a new blacklist
      for (var type in PROPERTY_BLACKLIST) {
        if (PROPERTY_BLACKLIST.hasOwnProperty(type) && type !== 'SKOS') {
          for (var i = 0; i < PROPERTY_BLACKLIST[type].length; i++) {
            this.blacklist.push(PREFIX[type] + PROPERTY_BLACKLIST[type][i]);
          }
        }
      }
    }
  } // end of constructor()

  /**
   * Requests class to class relations between the given uris.
   *
   * @param {string} originId - the uri of the class to start from
   * @param {string} targetId - the uri of the class to go to
   * @param {number} limit - the maximum number of relations to receive
   * @param {number} offset - the number of the relation to start with
   */
  requestClassClassRelation(originId, targetId, limit = 10, offset = 0) {
    const canceller = this.$q.defer();
    const promiseId = this.promises.addPromise(canceller);

    const originClassURI = this.nodes.getURIById(originId);
    const targetClassURI = this.nodes.getURIById(targetId);

    let query;
    if (this.rConfig.getPropertiesOrdered()) {
      query = this.queryFactory.getOrderedClassClassRelationQuery(originClassURI, targetClassURI, limit, offset);
    } else {
      query = this.queryFactory.getUnorderedClassClassRelationQuery(originClassURI, targetClassURI, limit, offset);
    }
    const requestURL = this.rConfig.getRequestURL();

    const self = this;

    this.$http.get(requestURL, this.rConfig.forQuery(query, canceller))
      .then(function handleClassClassRelations(response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined && bindings.length > 0) {

            self.$log.debug(`[Relations] ${bindings.length} between '${originClassURI}' and '${targetClassURI}'.`);

            if (bindings[0].prop !== undefined && bindings[0].prop.value !== undefined &&
                bindings[0].prop.value !== '') {

              let first = (offset === 0);

              // add uris if they are not blacklisted
              for (let i = 0; i < bindings.length; i++) {
                let currentURI = bindings[i].prop.value;

                // only add prop if not black listed
                if (!self.inBlacklist(currentURI)) {
                  var intermediateId = '';
                  var uriBetween = self.props.existsBetween(originId, targetId);
                  if (uriBetween === false) {
                    var propNode = {};
                    propNode.uri = currentURI;
                    propNode.type = 'property';
                    propNode.value = 1;
                    propNode.isLoopNode = (originId === targetId);
                    intermediateId = self.nodes.addNode(propNode);
                  } else {
                    intermediateId = self.props.getIntermediateId(originId, targetId);
                    self.nodes.incValueOfId(intermediateId);
                  }

                  if (intermediateId.length < 1) {
                    self.$log.error(`[Relations] Intermediate '${uriBetween}' was not found!`);
                  }

                  if (bindings[i].count !== undefined && bindings[i].count.value !== undefined) {
                    // call method WITH number of instances to indicate ordered prop list
                    self.props.addProperty(originId, intermediateId, targetId, currentURI, bindings[i].count.value);
                  } else {
                    // call method WITHOUT number of instances to indicate unordered prop list
                    self.props.addProperty(originId, intermediateId, targetId, currentURI);
                  }

                  if (first) {
                    self.requestPropertyLabel(currentURI);
                    first = false;
                  }
                } // end of if not blacklisted
              } // end of for loop over all bindings

              if (bindings.length === limit) {
                // there might be more, schedule next request
                self.requestClassClassRelation(originId, targetId, limit * 2, offset + bindings.length);
              }
            }
          } else {
            self.$log.debug(`[Relations] None between '${originClassURI}' and '${targetClassURI}'.`);
          }
        }
      }, function handleClassClassRelationExtractionError(err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === -1) {
            if (err.config !== undefined && err.config.timeout !== undefined &&
                err.config.timeout.$$state !== undefined && err.config.timeout.$$state.value === 'canceled') {
              self.$log.debug('[Relations] Class-class relation request was canceled!');
            } else {
              self.$log.warn('[Relations] No results, likely because of CORS.');
            }
          } else if (err.status === 500 && err.data.search('estimated execution time ') !== -1) {
            self.$log.debug('[Relations] Request would take too long!');
          }
        } else {
          self.$log.error(err);
        }
      }) // end of then()
      .finally(function () {
        self.promises.removePromise(promiseId);
      });
  }

  /**
   * Request the label for a property with the given uri.
   *
   * @param {string} uri - the uri of the property which label should be caught
   */
  requestPropertyLabel(uri) {
    const canceller = this.$q.defer();
    const promiseId = this.promises.addPromise(canceller);

    const labelLang = this.rConfig.getLabelLanguage();
    const query = this.queryFactory.getLabelQuery(uri, labelLang);
    const requestURL = this.rConfig.getRequestURL();

    const self = this;

    self.$log.debug(`[Property Label] Send Request for '${uri}'...`);

    this.$http.get(requestURL, this.rConfig.forQuery(query, canceller))
      .then(function handleExtractedPropertyLabel(response) {
        var bindings = response.data.results.bindings;
        if (bindings !== undefined && bindings.length > 0 && bindings[0].label !== undefined) {
          var label = bindings[0].label.value;
          self.$log.debug(`[Property Label] Found '${label}' for '${uri}'.`);
          self.props.insertValue(uri, 'name', label);
        } else {
          self.$log.debug(`[Property Label] Found None for '${uri}'.`);
        }
      }, function handleExtractedPropertyLabelError(err) {
        if (err.status === -1 && err.config !== undefined && err.config.timeout !== undefined &&
            err.config.timeout.$$state.value === 'canceled') {
          self.$log.debug('[Relations] Property label request was canceled!');
        } else if (err.status === 400) {
          if (typeof err.data === 'string' && err.data.indexOf(`syntax error at 'SAMPLE'`) !== -1) {
            self.$log.warn(`[Relation Extractor] Endpoint does not understand query with 'SAMPLE'!`);
          } else {
            self.$log.error(`[Relation Extractor] Endpoint returned bad request when retrieving property label.`);
            self.$log.error(err);
          }
        } else {
          self.$log.error(err);
        }
      })
      .finally(function () {
        self.promises.removePromise(promiseId);
      });
  } // end of requestPropertyLabel()

  /**
   * Request relation between origin class node and target data type node. The found relations will 
   * be added to the intermediate node.
   * 
   * @param {string} originClassId - the id of the origin class node
   * @param {string} intermediateId - the id of the node to which the resulting uris should be added
   * @param {string} targetTypeId - the id of the target data type node
   * @param {number} limit - the maximum amount of results
   * @param {number} offset - the offset for the results
   */
  requestClassTypeRelation(originClassId, intermediateId, targetTypeId, limit = 10, offset = 0) {
    const canceller = this.$q.defer();
    const promiseId = this.promises.addPromise(canceller);

    const classURI = this.nodes.getURIById(originClassId);
    const typeURI = this.nodes.getURIById(targetTypeId);

    let query;
    if (this.rConfig.getPropertiesOrdered()) {
      query = this.queryFactory.getOrderedClassTypeRelationQuery(classURI, typeURI, limit, offset);
    } else {
      query = this.queryFactory.getUnorderedClassTypeRelationQuery(classURI, typeURI, limit, offset);
    }

    const requestURL = this.rConfig.getRequestURL();

    const self = this;

    this.$http.get(requestURL, this.rConfig.forQuery(query, canceller))
      .then(function handleClassTypeRelations(response) {
        let bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {
          self.$log.debug(`[Relations] Found ${bindings.length} between '${classURI}' and '${typeURI}'.`);

          for (let i = 0; i < bindings.length; i++) {
            if (bindings[i].prop !== undefined && bindings[i].prop.value !== undefined) {
              let currentURI = bindings[i].prop.value;

              if (offset === 0 && i === 0) {
                self.nodes.setURI(intermediateId, currentURI);
              } else {
                // first one is skipped, because of placeholder
                self.nodes.incValueOfId(intermediateId);
              }

              if (bindings[i].count !== undefined && bindings[i].count.value !== undefined) {
                let currentCount = bindings[i].count.value;

                // add property WITH its count to indicate ordered prop list
                self.props.addProperty(originClassId, intermediateId, targetTypeId, currentURI, currentCount);
              } else {
                // add property without its count to indicate unordered prop list
                self.props.addProperty(originClassId, intermediateId, targetTypeId, currentURI);
              }
            }
          } // end of for loop over each binding

          // if limit was not high enough, send a new request with doubled limit
          if (bindings.length === limit) {
            let newOffset = (offset + bindings.length);
            self.requestClassTypeRelation(originClassId, intermediateId, targetTypeId, limit * 2, newOffset);
          }
        } else {
          self.$log.debug(`[Relations] Found none between '${classURI}' and '${typeURI}'.`);
        }
      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === 500 && err.data.search('estimated execution time') !== -1) {
            self.$log.debug('[Relations] Request would take too long.');
          } else {
            self.$log.error(err);
          }
        }  else {
          self.$log.error(err);
        }
      })
      .finally(function () {
        self.promises.removePromise(promiseId);
      });
  } // end of requestClassPropertyRelation()

  /**
   * Request whether given classes are equal by having the same instances.
   *
   * @param {string} classId1 - the id of the first class to check for equality
   * @param {string} classId2 - the id of the second class to check for equality
   * 
   * @return {*} promise
   */
  requestClassEquality(classId1, classId2) {
    var deferred = this.$q.defer();
    const promiseId = this.promises.addPromise(deferred);

    if (classId1 === undefined || classId2 === undefined) {
      deferred.reject('missing parameter');
      return deferred.promise;
    }

    // this makes absolutely no sense
    if (classId1 === classId2) {
      deferred.reject('same');
      return deferred.promise;
    }

    var classURI1 = this.nodes.getURIById(classId1);
    var classURI2 = this.nodes.getURIById(classId2);

    var query = this.queryFactory.getNumberOfCommonInstancesQuery(classURI1, classURI2);
    const requestURL = this.rConfig.getRequestURL();

    var count1 = this.nodes.getInstanceCountById(classId1);
    var count2 = this.nodes.getInstanceCountById(classId2);

    var self = this;

    self.$log.debug(`[Relations] Query for number of common Instances of '${classURI1}' and '${classURI2}'...`);

    this.$http.get(requestURL, this.rConfig.forQuery(query, deferred))
      .then(function handleCommonInstanceCounts(response) {

        var results = response.data.results;

        if (results !== undefined && results.hasOwnProperty('bindings')) {

          var bindings = results.bindings;

          if (bindings !== undefined && bindings.length > 0 && bindings[0].hasOwnProperty('commonInstanceCount')) {

            var commonCount = parseInt(bindings[0].commonInstanceCount.value);

            if (commonCount !== undefined) {
              self.$log.debug(`[Relations] Classes '${classURI1}' (${count1}) and '${classURI2}' (${count2}) have ` +
                `'${commonCount}' common instances!`);

              if ((commonCount === count1) && (commonCount === count2)) {
                self.$log.debug(`[Relations] Merge class '${classId1}' and '${classId2}'...`);

                // remove disjoint properties to avoid duplicates
                const disjointNodesToRemove = self.props.removeDisjointProperties(classId2);

                self.nodes.removeNodes(disjointNodesToRemove);

                //  then change all existing relations between the two classes
                const subClassPropNodes = self.props.mergePropertiesBetween(classId1, classId2);

                self.nodes.removeNodes(subClassPropNodes);

                // classes are equivalent, merge them
                const deletedId = self.nodes.mergeClasses(classId1, classId2);

                // save merged class
                if (deletedId !== '') {
                  deferred.resolve(deletedId);
                } else {
                  deferred.reject('already merged');
                }
              } else if (commonCount === count1 && commonCount < count2) {
                // class1 is a subclass of class2, create a relation
                self.$log.debug(`[Relations] '${classId1}' seems to be a subclass of '${classId2}'!`);

                // check if this relation is already known
                if (!self.nodes.hasSubClassPropNode(classId1, classId2)) {

                  // create an intermediate node
                  let subClassPropNode = {};
                  subClassPropNode.uri = self.props.SUBCLASS_URI;
                  subClassPropNode.type = 'subClassProperty';
                  subClassPropNode.name = 'Subclass of';
                  subClassPropNode.value = 10000;
                  subClassPropNode.commonInstances = commonCount;
                  subClassPropNode.childId = classId1;
                  subClassPropNode.parentId = classId2;

                  const subClassPropNodeId = self.nodes.addNode(subClassPropNode);

                  self.$log.debug(`Node between child ${classId1} and parent ${classId2} is '${subClassPropNodeId}'.`);

                  // create a property
                  self.props.addSubClassProperty(classId1, subClassPropNodeId, classId2);
                }

                deferred.reject('subclass');
              } else if (commonCount === count2 && commonCount < count1) {
                // class2 is a subclass of class1, create a relation
                self.$log.debug(`[Relations] '${classId2}' seems to be a subclass of '${classId1}'!`);


                // check whether this relation is already known
                if (!self.nodes.hasSubClassPropNode(classId1, classId2)) {

                  // create an intermediate node
                  let subClassPropNode = {};
                  subClassPropNode.uri = self.props.SUBCLASS_URI;
                  subClassPropNode.name = 'Subclass of';
                  subClassPropNode.type = 'subClassProperty';
                  subClassPropNode.value = 10000;
                  subClassPropNode.commonInstances = commonCount;
                  subClassPropNode.childId = classId2;
                  subClassPropNode.parentId = classId1;

                  const subClassPropNodeId = self.nodes.addNode(subClassPropNode);

                  self.$log.debug(`[Relations] Node between parent ${classId1} and child ${classId2} is ` +
                    `'${subClassPropNodeId}'.`);

                  // create a property
                  self.props.addSubClassProperty(classId2, subClassPropNodeId, classId1);
                }

                deferred.reject('subclass');
              } else if (commonCount === 0) {

                self.$log.debug('[Relations] ' + classId1 + ' and ' + classId2 + ' are disjoint.');

                var newDNode = {
                  uri: self.nodes.DISJOINT_NODE_URI,
                  type: 'disjointNode',
                  name: ' ',
                  value: 1.0,
                  classes: []
                };

                newDNode.classes.push(classId1);
                newDNode.classes.push(classId2);

                var disjointNodeId = self.nodes.addNode(newDNode);

                // TODO check against all connected classes
                self.props.addDisjointProp(classId1, disjointNodeId);
                self.props.addDisjointProp(classId2, disjointNodeId);

                deferred.reject('disjoint');
              } else {
                self.$log.debug(`[Relations] None between '${classURI1}' and '${classURI2}' via instance count.`);
                deferred.reject('no relation');
              }
            }
          }
        }
      }, function handleCommonInstancesError(err) {
        if (err.config !== undefined && err.config.timeout !== undefined && err.config.timeout.$$state !== undefined &&
            err.config.timeout.$$state.value === 'canceled') {
          self.$log.debug('[Relation Extractor] Common instances query was cancelled.');
        } else {
          self.$log.error(err);
        }

        deferred.reject(err);
      }) // end of then()
    .finally(function () {
      self.promises.removePromise(promiseId);
    });

    // always return a promise
    return deferred.promise;
  } // end of requestClassEquality()
} // end of class RelationExtractor

export default RelationExtractor;
