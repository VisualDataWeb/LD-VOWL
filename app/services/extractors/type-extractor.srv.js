'use strict';

module.exports = function ($http, RequestConfig, QueryFactory, Nodes, Properties, RelationExtractor) {

  var that = this;

  that.requestReferringTypes = function (classId) {
    var classURI = Nodes.getURIById(classId);
    var query = QueryFactory.getInstanceReferringTypesQuery(classURI, 5);
    var endpointURL = RequestConfig.getEndpointURL();

    // avoid loading types multiple times
    if (Nodes.getTypesLoaded()) {
      console.log("[Referring Types] Types for '" + classURI + "' are already loaded!");
      return;
    }

    console.log("[Referring Types] Send requests for types referring to instances of '" + classURI + "...");

    $http.get(endpointURL, RequestConfig.forQuery(query))
      .then(function (response) {

        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {

          console.log("[Referring Types] Found " + bindings.length + " for '" + classURI + "'.");

          Nodes.setTypesLoaded(classId);

          for (var j = 0; j < bindings.length; j++) {
            if (bindings[j].valType !== undefined && bindings[j].valType.hasOwnProperty('value')) {
              var newNode = {};
              newNode.uri = bindings[j].valType.value;
              newNode.type = 'type';
              newNode.value = 1;
              var typeId = Nodes.addNode(newNode);

              RelationExtractor.requestClassTypeRelation(classId, typeId);
            }
          }

        } else {
          console.log("[Referring Types] None found for instances of '" + classURI + "'.");
        }

      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === 500 &&  err.hasOwnProperty('data') && err.data.search('estimated execution time') !== -1) {
            console.log("[Referring Types] Request would take to long!");
          }
        } else {
          console.error(err);
        }
      });
  };
};
