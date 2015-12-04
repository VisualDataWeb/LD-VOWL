'use strict';

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
  constructor($http, PREFIX, PROPERTY_BLACKLIST, QueryFactory, RequestConfig, Nodes, Properties) {
    super();

    this.blacklist = [];

    HTTP = $http;
    QFACTORY = QueryFactory;
    RCONFIG = RequestConfig;
    NODES = Nodes;
    PROPS = Properties;

    for (var type in PROPERTY_BLACKLIST) {
      if (PROPERTY_BLACKLIST.hasOwnProperty(type)) {
        for (var i = 0; i<PROPERTY_BLACKLIST[type].length; i++) {
          this.blacklist.push(PREFIX[type] + PROPERTY_BLACKLIST[type][i]);
        }
      }
    }
  }

  /**
   * Requests class to class relations between the given uris.
   *
   * @param originClassURI - the uri of the class to start from
   * @param targetClassURI - the uri of the class to go to
   */
  requestClassClassRelation(originClassURI, targetClassURI) {
    var limit = 10;
    var query = QFACTORY.getClassClassRelationQuery(originClassURI, targetClassURI, limit);
    var endpointURL = RCONFIG.getEndpointURL();

    var self = this;

    console.log("[Relations] Search between " + originClassURI + " and " + targetClassURI + "...");

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined && bindings.length > 0) {

            console.log("[Relations] " + bindings.length + " between '" + originClassURI +
              "' and '" + targetClassURI + "'.");

            if (bindings[0].prop !== undefined) {
              if (bindings[0].prop.value !== undefined && bindings[0].prop.value !== '') {
                var originIndex = NODES.getIndexOf(originClassURI);
                var targetIndex = NODES.getIndexOf(targetClassURI);

                var first = true;
                var index = 0;

                // add uris if they are not blacklisted
                for (var i = 0; i < bindings.length; i++) {
                  var currentURI = bindings[i].prop.value;

                  // only add prop if not black listed
                  if (!self.inBlacklist(currentURI)) {
                    console.log("[Relations] Add property '" + currentURI + "' from " +
                      originIndex + " to " + targetIndex + ".");
                    PROPS.addProperty(originIndex, targetIndex, currentURI);
                    if (first) {
                      index = i;
                      first = false;
                    }
                  }
                }

                // now search for a label
                self.requestPropertyLabel(bindings[index].prop.value);
              }
            }
          } else {
            console.log("[Relations] None between '" + originClassURI + "' and '" + targetClassURI + "'...");
          }
        }
      }, function (err) {
        console.error(err);
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

  requestClassPropertyRelation(classURI, typeURI) {
    var query = QFACTORY.getClassTypeRelationQuery(classURI, typeURI);
    var endpointURL = RCONFIG.getEndpointURL();

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {

        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {

          console.log("[Relations] Found '" + bindings.length + "' between " + classURI + "' and '" + typeURI + "'.");

          for (var i = 0; i < bindings.length; i++) {
            if (bindings[i].prop.value !== undefined && bindings[i].prop.Name !== '') {
              var sourceIndex = NODES.getIndexOf(classURI);
              var targetIndex = NODES.getIndexOf(typeURI);
              if (sourceIndex !== -1 && targetIndex !== -1) {
                PROPS.addProperty(sourceIndex, targetIndex, bindings[i].prop.value);
              }
            }
          }
        }

      }, function (err) {
        console.error(err);
      });
  }

} // end of class RelationExtractor

module.exports = RelationExtractor;
