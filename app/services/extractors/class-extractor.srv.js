'use strict';

var Extractor = require('./extractor.srv');

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
   */
  constructor ($http, $q, $log, PREFIX, CLASS_BLACKLIST, RequestConfig, QueryFactory, Nodes) {

    // call constructor of Extractor
    super();
    
    // set up attributes
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
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
    var self = this;

    var deferred = this.$q.defer();

    // do not request further classes
    if (!this.nodes.isEmpty()) {
      self.$log.debug("[Classes] Skip loading further classes...");
      deferred.resolve([]);
      return deferred.promise;
    }

    var limit = this.reqConfig.getLimit() || 10;
    var offset = 0;

    var query = this.queryFactory.getClassQuery(limit, offset);
    var endpointURL = this.reqConfig.getEndpointURL();

    self.$log.debug('[Classes] Send Request...');

    this.$http.get(endpointURL, this.reqConfig.forQuery(query))
      .then(function (response) {
        if (response.data.results !== undefined) {
          var bindings = response.data.results.bindings;

          if (bindings !== undefined) {

            // endpoint may ignore limit
            bindings = bindings.slice(0, Math.min(bindings.length, limit*2));

            var newClassIds = [];

            for (var i = 0; i < bindings.length; i++) {

              var currentClassURI = bindings[i].class.value;

              if (!self.inBlacklist(currentClassURI)) {
                var node = {};

                node.uri = currentClassURI;
                node.name = (bindings[i].label !== undefined) ? bindings[i].label.value : '';
                node.value = parseInt(bindings[i].instanceCount.value);
                node.type = 'class';
                node.active = false;
                var newClassId = self.nodes.addNode(node);

                newClassIds.push(newClassId);

                if (bindings[i].class !== undefined && bindings[i].class.value !== undefined) {
                  self.requestClassLabel(newClassId, currentClassURI);

                  // optionally get sub classes
                  if (self.extractSubClasses) {
                    self.requestSubClassesOf(currentClassURI);
                  }
                }
              }
            }

            deferred.resolve(newClassIds);
          } else {
            self.$log.debug('[Classes] No further classes found!');
            deferred.resolve([]);
          }
        } else {
          self.$log.error(response);
        }
      }, function (err) {
        self.$log.error(err);
        deferred.reject([]);
      });

      return deferred.promise;
  }

  requestClassLabel (classId, classURI) {
    var self = this;

    var labelLang = this.reqConfig.getLabelLanguage();
    var labelQuery = this.queryFactory.getLabelQuery(classURI, labelLang);
    var endpointURL = this.reqConfig.getEndpointURL();

    self.$log.debug("[Class Label] Send request for '" + classURI + "'...");

    this.$http.get(endpointURL, this.reqConfig.forQuery(labelQuery))
      .then(function (response) {
        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0 && bindings[0].label !== undefined &&
            bindings[0].label.value !== '') {
          var label = bindings[0].label.value;
          self.nodes.insertLabel(classId, label);
          self.$log.debug("[Class Label] Found '" + label + "' for '" + classURI + "'.");
        } else {
          self.$log.debug("[Class Label] Found None for '" + classURI + "'.");
        }
      },function (err) {
        self.$log.error(err);
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
          self.$log.debug("[Subclasses] None found for '" + classURI + "'.");
        }
      }, function (err) {
        self.$log.error(err);
      });
  }
} // end of class 'ClassExtractor'

module.exports = ClassExtractor;
