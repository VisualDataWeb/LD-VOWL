'use strict';

var Extractor = require('./extractor.srv');

/**
 * @Name ClassExtractor
 */
class ClassExtractor extends Extractor {

  constructor ($http, $q, PREFIX, CLASS_BLACKLIST, RequestConfig, QueryFactory, Nodes) {
    super();
    
    // set up attributes
    this.$http = $http;
    this.$q = $q;
    this.reqConfig = RequestConfig;
    this.queryFactory = QueryFactory;
    this.nodes = Nodes;
    
    this.extractSubClasses = false;

    // set up blacklists
    for (var type in CLASS_BLACKLIST) {
      if (CLASS_BLACKLIST.hasOwnProperty(type)) {
        for (var i = 0; i < CLASS_BLACKLIST[type].length; i++) {
          this.blacklist.push(PREFIX[type] + CLASS_BLACKLIST[type][i]);
        }
      }
    }
  }

  requestClasses() {
    var deferred = this.$q.defer();

    // do not request further classes
    if (!this.nodes.isEmpty()) {
      deferred.resolve([]);
    }

    var limit = this.reqConfig.getLimit() || 10;
    var offset = 0;

    var query = this.queryFactory.getClassQuery(limit, offset);
    var endpointURL = this.reqConfig.getEndpointURL();

    var self = this;

    console.log('[Classes] Send Request...');

    this.$http.get(endpointURL, this.reqConfig.forQuery(query))
      .then(function (response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined) {

            // endpoint may ignore limit
            bindings = bindings.slice(0, Math.min(bindings.length, limit*2));

            var classes = [];

            for (var i = 0; i < bindings.length; i++) {

              var currentClassURI = bindings[i].class.value;

              if (!self.inBlacklist(currentClassURI)) {
                classes.push(currentClassURI);

                var node = {};
                node.uri = currentClassURI;
                node.name = (bindings[i].label !== undefined) ? bindings[i].label.value : '';
                node.value = parseInt(bindings[i].instanceCount.value);
                node.type = 'class';
                node.active = false;
                self.nodes.addNode(node);

                if (bindings[i].class !== undefined && bindings[i].class.value !== undefined) {
                  self.requestClassLabel(currentClassURI);

                  // optionally get sub classes
                  if (self.extractSubClasses) {
                    self.requestSubClassesOf(currentClassURI);
                  }
                }
              }
            }

            deferred.resolve(classes);
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
    var labelLang = this.reqConfig.getLabelLanguage();
    var labelQuery = this.queryFactory.getLabelQuery(classURI, labelLang);
    var endpointURL = this.reqConfig.getEndpointURL();

    console.log("[Class Label] Send request for '" + classURI + "'...");

    var self = this;

    this.$http.get(endpointURL, this.reqConfig.forQuery(labelQuery))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings[0].label !== undefined && bindings[0].label.value !== '') {
          var label = bindings[0].label.value;
          self.nodes.insertValue(classURI, 'name', label);
          console.log("[Class Label] Found '" + label + "' for '" + classURI + "'.");
        } else {
          console.log("[Class Label] Found None for '" + classURI + "'.");
        }
      },function (err) {
        console.error(err);
      });
  }

  requestSubClassesOf(classURI) {
    var lang = this.reqConfig.getLabelLanguage();
    var limit = 5;
    var offset = 0;

    var query = this.queryFactory.getSubClassQuery(classURI, lang, limit, offset);
    var endpointURL = this.reqConfig.getEndpointURL();

    var self = this;

    this.$http.get(endpointURL, this.reqConfig.forQuery(query))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings.length > 0) {
          for (var i = 0; i < bindings.length; i++) {
            if (bindings[i].class !== undefined) {
              var node = {};
              node.uri = bindings[i].class.value;
              node.name = bindings[i].label.value;
              self.nodes.addNode(node);
            }
          }
        } else {
          console.log("[Subclasses] None found for '" + classURI + "'.");
        }
      }, function (err) {
        console.error(err);
      });
  }

} // end of class 'ClassExtractor'

module.exports = ClassExtractor;
