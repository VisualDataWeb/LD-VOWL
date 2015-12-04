'use strict';

module.exports = function ($http, RequestConfig, QueryFactory, Nodes, RelationExtractor) {

  var that = this;

  that.requestReferringTypes = function (classURI) {
    var query = QueryFactory.getInstanceReferringTypesQuery(classURI, 5);
    var endpointURL = RequestConfig.getEndpointURL();

    $http.get(endpointURL, RequestConfig.forQuery(query))
      .then(function (response) {

        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {

          console.log("[Referring Types] Found " + bindings.length + " for '" + classURI + "'.");

          for (var i = 0; i < bindings.length; i++) {
            if (bindings[i].valType !== undefined && bindings[i].valType.hasOwnProperty('value')) {
              var newNode = {};
              newNode.uri = bindings[i].valType.value;
              newNode.type = 'type';
              Nodes.addNode(newNode);

              RelationExtractor.requestClassPropertyRelation(classURI, bindings[i].valType.value);
            }
          }

        } else {
          console.log("[Referring Types] None found for instances of '" + classURI + "'.");
        }

      }, function (err) {
        console.error(err);
      });
  };
};
