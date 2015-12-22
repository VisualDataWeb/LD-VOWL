'use strict';

var SUBCLASS_URI = "http://my-own-sub-class";
var HTTP = {};
var QFACTORY = {};
var RCONFIG = {};
var NODES = {};
var PROPS = {};

var Extractor = require('./extractor.srv');

class RelationExtractor extends Extractor {
  
  /**
   * Creates a RelationExtractor.
   */
  constructor($http, $q, PREFIX, PROPERTY_BLACKLIST, QueryFactory, RequestConfig, Nodes, Properties) {
    super();

    this.blacklist = [];
    this.$q = $q;

    HTTP = $http;
    QFACTORY = QueryFactory;
    RCONFIG = RequestConfig;
    NODES = Nodes;
    PROPS = Properties;

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

    var originClassURI = NODES.getURIById(originId);
    var targetClassURI = NODES.getURIById(targetId);

    var query = QFACTORY.getClassClassRelationQuery(originClassURI, targetClassURI, limit, offset);
    var endpointURL = RCONFIG.getEndpointURL();

    var self = this;

    //console.log("[Relations] Search between '" + originClassURI + "' and '" + targetClassURI + "'...");

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined && bindings.length > 0) {

            console.log("[Relations] " + bindings.length + " between '" + originClassURI + "' and '" +
              targetClassURI + "'.");

            if (bindings[0].prop !== undefined && bindings[0].prop.value !== undefined &&
                bindings[0].prop.value !== '') {

              // add uris if they are not blacklisted
              for (var i = 0; i < bindings.length; i++) {
                var currentURI = bindings[i].prop.value;

                // only add prop if not black listed
                if (!self.inBlacklist(currentURI)) {
                  var intermediateId = "";
                  var uriBetween = PROPS.existsBetween(originId, targetId);
                  if (uriBetween === false) {
                    var propNode = {};
                    propNode.uri = currentURI;
                    propNode.type = 'property';
                    propNode.value = 1;
                    intermediateId = NODES.addNode(propNode);
                  } else {
                    intermediateId = PROPS.getIntermediateIndex(originId, targetId);
                    NODES.incValueOfId(intermediateId);
                  }

                  if (intermediateId.length < 1) {
                    console.error("[Relations] Intermediate " + uriBetween + " was not found!");
                  }

                  PROPS.addProperty(originId, intermediateId, targetId, currentURI);
                }
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
            console.log("[Relations] None between '" + originClassURI + "' and '" + targetClassURI + "'...");
          }
        }
      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === -1) {
            console.log("[Relations] No results, likely because of CORS.");
          } else if (err.status === 500 && err.data.search("estimated execution time ") !== -1) {
            console.log("[Relations] Request would take too long!");
          }
        } else {
          console.error(err);
        }
      });
  }

  /**
   * Request the label for a property with the given uri.
   *
   * @param uri - the uri of the property which label should be caught
   */
  requestPropertyLabel(uri) {
    var labelLang = RCONFIG.getLabelLanguage();
    var query = QFACTORY.getLabelQuery(uri, labelLang);
    var endpointURL = RCONFIG.getEndpointURL();

    console.log("[Property Label] Send Request for '" + uri + "'...");

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {
        var bindings = response.data.results.bindings;
        if (bindings !== undefined && bindings.length > 0 && bindings[0].label !== undefined) {
          var label = bindings[0].label.value;
          console.log("[Property Label] Found '" + label + "' for '" + uri + "'.");
          PROPS.insertValue(uri, 'name', label);
        } else {
          console.log("[Property Label] Found None for '" + uri + "'.");
        }
      }, function (err) {
        console.error(err);
      });
  }

  requestClassTypeRelation(originClassId, targetTypeId) {
    var classURI = NODES.getURIById(originClassId);
    var typeURI = NODES.getURIById(targetTypeId);

    var query = QFACTORY.getClassTypeRelationQuery(classURI, typeURI);
    var endpointURL = RCONFIG.getEndpointURL();

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {

        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {

          console.log("[Relations] Found '" + bindings.length + "' between " + classURI + "' and '" + typeURI + "'.");

          for (var i = 0; i < bindings.length; i++) {
            if (bindings[i].prop.value !== undefined) {

              var uriInBetween = PROPS.existsBetween(originClassId, targetTypeId);

              var intermediateId = "";
              if (uriInBetween === false) {

                // add property node
                var propNode = {};
                propNode.uri = bindings[i].prop.value;
                propNode.type = 'datatypeProperty';
                propNode.value = 1;
                intermediateId = NODES.addNode(propNode);
              } else {
                intermediateId = PROPS.getIntermediateIndex(originClassId, targetTypeId);
                NODES.incValueOfId(intermediateId);
              }

              PROPS.addProperty(originClassId, intermediateId, targetTypeId, bindings[i].prop.value);
              //if (originClassId !== -1 && targetTypeId !== -1 && intermediateId !== "") {
              //} else {
              //  console.error("[Relations] Error adding relation between '" + classURI + "' and '" + typeURI + "'.");
              //}
            }
          }
        }

      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === 500 && err.data.search('estimated execution time') !== -1) {
            console.log("[Relations] Request would take too long.");
          } else {
            console.err(err);
          }
        }  else {
          console.error(err);
        }
      });
  } // end of requestClassPropertyRelation()

  /**
   * Request whether given classes are equal by having the same instances.
   *
   * @param classId1 - the id of the first class to check for equality
   * @param classId - the id of the second class to check for equality
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

    var classURI1 = NODES.getURIById(classId1);
    var classURI2 = NODES.getURIById(classId2);

    var query = QFACTORY.getNumberOfCommonInstancesQuery(classURI1, classURI2);
    var endpointURL = RCONFIG.getEndpointURL();

    var count1 = NODES.getInstanceCountById(classId1);
    var count2 = NODES.getInstanceCountById(classId2);

    if (Math.abs(count1 - count2) < count1 * 0.1) {
      console.log("[Relations] Query for number of common Instances of '" + classURI1 + "' and '" + classURI2 + "'...");

      HTTP.get(endpointURL, RCONFIG.forQuery(query))
        .then(function (response) {

          var results = response.data.results;

          if (results !== undefined && results.hasOwnProperty('bindings')) {

            var bindings = results.bindings;

            if (bindings !== undefined && bindings.length > 0 && bindings[0].hasOwnProperty('commonInstanceCount')) {

              var commonCount = parseInt(bindings[0].commonInstanceCount.value);

              if (commonCount !== undefined) {
                console.log("[Relations] Classes '" + classURI1 + "' (" + count1 + ") and '" +
                  classURI2 + "' (" + count2 + ") have " + commonCount + " common instances!");

                var subClassPropNode;
                var subClassPropNodeId;

                if ((commonCount === count1) && (commonCount === count2)) {
                  console.log("[Relations] Merge class '" + classId1 + "' and ' " + classId2 + "'...");
                  //  first change all existing relations between the two classes
                  PROPS.mergePropertiesBetween(classId1, classId2);

                  // classes are equivalent, merge them
                  NODES.mergeClasses(classId1, classId2);

                  // save merged class
                  deferred.resolve(classId2);
                } else if (commonCount === count1 && commonCount < count2) {
                  // class1 is a subclass of class2, create a relation

                  // create an intermediate node
                  subClassPropNode = {};
                  subClassPropNode.uri = SUBCLASS_URI;
                  subClassPropNode.type = "property";
                  subClassPropNode.value = 1;

                  subClassPropNodeId = NODES.addNode(subClassPropNode);

                  // create a property
                  PROPS.addProperty(classId1, subClassPropNodeId, classId2, SUBCLASS_URI);
                  deferred.reject("subclass");
                } else if (commonCount === count2 && commonCount < count1) {
                  // class2 is a subclass of class1, create a relation

                  // create an intermediate node
                  subClassPropNode = {};
                  subClassPropNode.uri = SUBCLASS_URI;
                  subClassPropNode.type = "property";
                  subClassPropNode.value = 1;

                  subClassPropNodeId = NODES.addNode(subClassPropNode);

                  // create a property
                  PROPS.addProperty(classId2, subClassPropNodeId, classId1, SUBCLASS_URI);
                  deferred.reject("subclass");
                } else {
                  console.log("[Relations] No Relation between '" + classURI1 + "' and '" + classURI2 +
                    "' was found via instance count.");
                  deferred.reject("no relation");
                }
              }
            }
          }
        }, function (err) {
          console.error(err);
          deferred.reject(err);
        });

    } else {
      deferred.reject("not needed");
    }

    // always return a promise
    return deferred.promise;

  } // end of requestClassEquality()
} // end of class RelationExtractor

module.exports = RelationExtractor;
