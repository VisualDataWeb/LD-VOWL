'use strict';

var HTTP = {};
var q = {};
var RCONFIG = {};
var QFACTORY = {};
var NODES = {};

var Extractor = require('./extractor.srv');

class ClassExtractor extends Extractor {

  constructor ($http, $q, PREFIX, CLASS_BLACKLIST, RequestConfig, QueryFactory, Nodes) {
    super();
    HTTP = $http;
    q = $q;
    RCONFIG = RequestConfig;
    QFACTORY = QueryFactory;
    NODES = Nodes;

    for (var type in CLASS_BLACKLIST) {
      if (CLASS_BLACKLIST.hasOwnProperty(type)) {
        for (var i = 0; i < CLASS_BLACKLIST[type].length; i++) {
          this.blacklist.push(PREFIX[type] + CLASS_BLACKLIST[type][i]);
        }
      }
    }
    this.extractSubClasses = false;
  }

  requestClasses() {
    var deferred = q.defer();

    var limit = RCONFIG.getLimit() || 10;
    var offset = 0;

    var query = QFACTORY.getClassQuery(limit, offset);
    var endpointURL = RCONFIG.getEndpointURL();

    var self = this;

    console.log('[Classes] Send Request...');

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined) {

            // endpoint may ignore limit
            bindings = bindings.slice(0, Math.min(bindings.length, limit*2));

            for (var i = 0; i < bindings.length; i++) {

              var currentClassURI = bindings[i].class.value;

              if (!self.inBlacklist(currentClassURI)) {
                var node = {};
                node.uri = currentClassURI;
                node.name = (bindings[i].label !== undefined) ? bindings[i].label.value : '';
                node.value = parseInt(bindings[i].instanceCount.value);
                node.type = 'class';
                node.active = false;
                NODES.addNode(node);

                if (bindings[i].class !== undefined && bindings[i].class.value !== undefined) {
                  self.requestClassLabel(currentClassURI);

                  // sub classes
                  if (self.extractSubClasses) {
                    self.requestSubClassesOf(currentClassURI);
                  }
                }
              }
            }

            deferred.resolve(bindings);
          } else {
            console.log('[Classes] No further classes found!');
            deferred.resolve([]);
          }
        } else {
          console.error(response);
        }
      }, function (err) {
        console.error(err);
        deferred.reject([]);
      });

      return deferred.promise;
  }

  requestClassLabel (classURI) {
    var labelLang = RCONFIG.getLabelLanguage();
    var labelQuery = QFACTORY.getLabelQuery(classURI, labelLang);
    var endpointURL = RCONFIG.getEndpointURL();

    console.log("[Class Label] Send request for '" + classURI + "'...");

    HTTP.get(endpointURL, RCONFIG.forQuery(labelQuery))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings[0].label !== undefined && bindings[0].label.value !== '') {
          var label = bindings[0].label.value;
          NODES.insertValue(classURI, 'name', label);
          console.log("[Class Label] Found '" + label + "' for '" + classURI + "'.");
        } else {
          console.log("[Class Label] Found None for '" + classURI + "'.");
        }
      },function (err) {
        console.error(err);
      });
  }

  requestSubClassesOf(classURI) {
    var lang = RCONFIG.getLabelLanguage();
    var limit = 5;
    var offset = 0;

    var query = QFACTORY.getSubClassQuery(classURI, lang, limit, offset);
    var endpointURL = RCONFIG.getEndpointURL();

    HTTP.get(endpointURL, RCONFIG.forQuery(query))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings.length > 0) {
          for (var i = 0; i < bindings.length; i++) {

            if (bindings[i].class !== undefined) {
              var node = {};
              node.uri = bindings[i].class.value;
              node.name = bindings[i].label.value;
              NODES.addNode(node);
            }
          }
        } else {
          console.log("[Subclasses] None found for '" + classURI + "'.");
        }
      }, function (err) {
        console.error(err);
      });
  }

}

module.exports = ClassExtractor;
