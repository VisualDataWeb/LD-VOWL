'use strict';

var Extractor = require('./extractor.srv');

/**
 * @name RelationExtractor
 * @extends Extractor
 */
class RelationExtractor extends Extractor {
  
  /**
   * Creates a RelationExtractor.
   */
  constructor($http, $q, $log, PREFIX, PROPERTY_BLACKLIST, QueryFactory, RequestConfig, Nodes, Properties) {

    // call constructor of super class Extractor
    super();

    this.blacklist = [];
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
    this.qFactory = QueryFactory;
    this.rConfig = RequestConfig;
    this.nodes = Nodes;
    this.props = Properties;

    for (var type in PROPERTY_BLACKLIST) {
      if (PROPERTY_BLACKLIST.hasOwnProperty(type)) {
        for (var i = 0; i < PROPERTY_BLACKLIST[type].length; i++) {
          this.blacklist.push(PREFIX[type] + PROPERTY_BLACKLIST[type][i]);
        }
      }
    }
  }

  /**
   * Requests class to class relations between the given uris.
   *
   * @param originId - the uri of the class to start from
   * @param targetId - the uri of the class to go to
   * @param limit - the maximum number of relations to receive
   * @param offset - the number of the relation to start with
   */
  requestClassClassRelation(originId, targetId, limit, offset) {
    offset = offset || 0;
    limit = limit || 10;

    var originClassURI = this.nodes.getURIById(originId);
    var targetClassURI = this.nodes.getURIById(targetId);

    var query = '';
    if (this.rConfig.getPropertiesOrdered()) {
      query = this.qFactory.getOrderedClassClassRelationQuery(originClassURI, targetClassURI, limit, offset);
    } else {
      query = this.qFactory.getUnorderedClassClassRelationQuery(originClassURI, targetClassURI, limit, offset);
    }
    var requestURL = this.rConfig.getRequestURL();

    var self = this;

    this.$http.get(requestURL, this.rConfig.forQuery(query))
      .then(function (response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined && bindings.length > 0) {

            self.$log.debug("[Relations] " + bindings.length + " between '" + originClassURI + "' and '" +
              targetClassURI + "'.");

            if (bindings[0].prop !== undefined && bindings[0].prop.value !== undefined &&
                bindings[0].prop.value !== '') {

              // add uris if they are not blacklisted
              for (var i = 0; i < bindings.length; i++) {
                var currentURI = bindings[i].prop.value;

                // only add prop if not black listed
                if (!self.inBlacklist(currentURI)) {
                  var intermediateId = "";
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
                    self.$log.error("[Relations] Intermediate " + uriBetween + " was not found!");
                  }

                  if (bindings[i].count !== undefined && bindings[i].count.value !== undefined) {
                    // call method WITH number of instances to indicate ordered prop list
                    self.props.addProperty(originId, intermediateId, targetId, currentURI, bindings[i].count.value);
                  } else {
                    // call method WITHOUT number of instances to indicate unordered prop list
                    self.props.addProperty(originId, intermediateId, targetId, currentURI);
                  }

                } // end of if not blacklisted
              } // end of for loop over all bindings

              if (offset === 0 && bindings.length > 0) {
                // now search for a label
                self.requestPropertyLabel(bindings[0].prop.value);
              }

              if (bindings.length === limit) {
                // there might be more, schedule next request
                self.requestClassClassRelation(originId, targetId, limit * 2, offset + bindings.length);
              }
            }
          } else {
            self.$log.debug("[Relations] None between '" + originClassURI + "' and '" + targetClassURI + "'...");
          }
        }
      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === -1) {
            self.$log.warn("[Relations] No results, likely because of CORS.");
          } else if (err.status === 500 && err.data.search("estimated execution time ") !== -1) {
            self.$log.debug("[Relations] Request would take too long!");
          }
        } else {
          self.$log.error(err);
        }
      });
  }

  /**
   * Request the label for a property with the given uri.
   *
   * @param uri - the uri of the property which label should be caught
   */
  requestPropertyLabel(uri) {
    var labelLang = this.rConfig.getLabelLanguage();
    var query = this.qFactory.getLabelQuery(uri, labelLang);
    var requestURL = this.rConfig.getRequestURL();

    var self = this;

    self.$log.debug("[Property Label] Send Request for '" + uri + "'...");

    this.$http.get(requestURL, this.rConfig.forQuery(query))
      .then(function (response) {
        var bindings = response.data.results.bindings;
        if (bindings !== undefined && bindings.length > 0 && bindings[0].label !== undefined) {
          var label = bindings[0].label.value;
          self.$log.debug("[Property Label] Found '" + label + "' for '" + uri + "'.");
          self.props.insertValue(uri, 'name', label);
        } else {
          self.$log.debug("[Property Label] Found None for '" + uri + "'.");
        }
      }, function (err) {
        self.$log.error(err);
      });
  }

  requestClassTypeRelation(originClassId, targetTypeId) {
    var classURI = this.nodes.getURIById(originClassId);
    var typeURI = this.nodes.getURIById(targetTypeId);

    var query = this.qFactory.getClassTypeRelationQuery(classURI, typeURI);
    var requestURL = this.rConfig.getRequestURL();

    var self = this;

    this.$http.get(requestURL, this.rConfig.forQuery(query))
      .then(function (response) {

        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {

          self.$log.debug("[Relations] Found '" + bindings.length + "' between " + classURI + "' and '" + typeURI +
            "'.");

          for (var i = 0; i < bindings.length; i++) {
            if (bindings[i].prop.value !== undefined) {

              var uriInBetween = self.props.existsBetween(originClassId, targetTypeId);

              var intermediateId = "";
              if (uriInBetween === false) {

                // add property node
                var propNode = {};
                propNode.uri = bindings[i].prop.value;
                propNode.type = 'datatypeProperty';
                propNode.value = 1;
                intermediateId = self.nodes.addNode(propNode);
              } else {
                intermediateId = self.props.getIntermediateId(originClassId, targetTypeId);
                self.nodes.incValueOfId(intermediateId);
              }

              self.props.addProperty(originClassId, intermediateId, targetTypeId, bindings[i].prop.value);
            }
          } // end of for loop over each binding
        }
      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === 500 && err.data.search('estimated execution time') !== -1) {
            self.$log.debug("[Relations] Request would take too long.");
          } else {
            self.$log.error(err);
          }
        }  else {
          self.$log.error(err);
        }
      });
  } // end of requestClassPropertyRelation()

  /**
   * Request whether given classes are equal by having the same instances.
   *
   * @param classId1 - the id of the first class to check for equality
   * @param classId2 - the id of the second class to check for equality
   */
  requestClassEquality(classId1, classId2) {

    var deferred = this.$q.defer();

    if (classId1 === undefined || classId2 === undefined) {
      deferred.resolve("missing parameter");
      return deferred.promise;
    }

    // this makes absolutely no sense
    if (classId1 === classId2) {
      deferred.resolve("equal");
      return deferred.promise;
    }

    var classURI1 = this.nodes.getURIById(classId1);
    var classURI2 = this.nodes.getURIById(classId2);

    var query = this.qFactory.getNumberOfCommonInstancesQuery(classURI1, classURI2);
    var requestURL = this.rConfig.getRequestURL();

    var count1 = this.nodes.getInstanceCountById(classId1);
    var count2 = this.nodes.getInstanceCountById(classId2);

    var self = this;

    self.$log.debug("[Relations] Query for number of common Instances of '" + classURI1 + "' and '" + classURI2 +
      "'...");

    this.$http.get(requestURL, this.rConfig.forQuery(query))
      .then(function (response) {

        var results = response.data.results;

        if (results !== undefined && results.hasOwnProperty('bindings')) {

          var bindings = results.bindings;

          if (bindings !== undefined && bindings.length > 0 && bindings[0].hasOwnProperty('commonInstanceCount')) {

            var commonCount = parseInt(bindings[0].commonInstanceCount.value);

            if (commonCount !== undefined) {
              self.$log.debug("[Relations] Classes '" + classURI1 + "' (" + count1 + ") and '" +
                classURI2 + "' (" + count2 + ") have " + commonCount + " common instances!");

              var subClassPropNode;
              var subClassPropNodeId;

              if ((commonCount === count1) && (commonCount === count2)) {
                self.$log.debug("[Relations] Merge class '" + classId1 + "' and ' " + classId2 + "'...");
                //  first change all existing relations between the two classes
                self.props.mergePropertiesBetween(classId1, classId2);

                // classes are equivalent, merge them
                self.nodes.mergeClasses(classId1, classId2);

                // save merged class
                deferred.resolve(classId2);
              } else if (commonCount === count1 && commonCount < count2) {
                // class1 is a subclass of class2, create a relation
                self.$log.debug("[Relations] " + classId1 + " seems to be a subclass of " + classId2 + "!");

                // create an intermediate node
                subClassPropNode = {};
                subClassPropNode.uri = self.props.SUBCLASS_URI;
                subClassPropNode.type = "subClassProperty";
                subClassPropNode.name = "Subclass of";
                subClassPropNode.value = 10000;
                subClassPropNode.commonInstances = commonCount;

                subClassPropNodeId = self.nodes.addNode(subClassPropNode);

                // create a property
                self.props.addSubClassProperty(classId1, subClassPropNodeId, classId2);
                deferred.reject("subclass");
              } else if (commonCount === count2 && commonCount < count1) {
                // class2 is a subclass of class1, create a relation
                self.$log.debug("[Relations] " + classId2 + " seems to be a subclass of " + classId1 + "!");

                // create an intermediate node
                subClassPropNode = {};
                subClassPropNode.uri = self.props.SUBCLASS_URI;
                subClassPropNode.name = "Subclass of";
                subClassPropNode.type = "subClassProperty";
                subClassPropNode.value = 10000;
                subClassPropNode.commonInstances = commonCount;

                subClassPropNodeId = self.nodes.addNode(subClassPropNode);

                // create a property
                self.props.addSubClassProperty(classId2, subClassPropNodeId, classId1);
                deferred.reject("subclass");
              } else {
                self.$log.debug("[Relations] No Relation between '" + classURI1 + "' and '" + classURI2 +
                  "' was found via instance count.");
                deferred.reject("no relation");
              }
            }
          }
        }
      }, function (err) {
        self.$log.error(err);
        deferred.reject(err);
      });

    // always return a promise
    return deferred.promise;
  } // end of requestClassEquality()
} // end of class RelationExtractor

module.exports = RelationExtractor;
