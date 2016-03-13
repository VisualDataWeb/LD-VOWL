'use strict';
/**
 *
 * @param $http
 * @param $q
 * @param $log
 * @param RequestConfig
 * @param QueryFactory
 * @param Nodes
 * @param Properties
 * @param {RelationExtractor} RelationExtractor
 * @param Promises
 */
function typeExtractor($http, $q, $log, RequestConfig, QueryFactory, Nodes, Properties, RelationExtractor, Promises) {

  'ngInject';

  /* jshint validthis: true */
  var that = this;

  that.requestReferringTypes = function (classId) {

    var canceller = $q.defer();
    const promiseId = Promises.addPromise(canceller);

    var classURI = Nodes.getURIById(classId);
    var query = QueryFactory.getInstanceReferringTypesQuery(classURI, 5);
    var requestURL = RequestConfig.getRequestURL();

    // avoid loading types multiple times
    if (Nodes.getTypesLoaded(classId)) {
      $log.debug(`[Referring Types] Types for '${classURI}' are already loaded!`);
      return;
    }

    $log.debug(`[Referring Types] Send requests for types referring to instances of '${classURI}'...`);

    $http.get(requestURL, RequestConfig.forQuery(query, canceller))
      .then(function (response) {

        if (response === undefined || response.data === undefined || response.data.results === undefined) {
          $log.warn('[Referring Types] No results');
          return;
        }

        var bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {

          $log.debug(`[Referring Types] Found ${bindings.length} for '${classURI}'.`);

          for (var j = 0; j < bindings.length; j++) {
            if (bindings[j].valType !== undefined && bindings[j].valType.hasOwnProperty('value')) {

              let typeURI = bindings[j].valType.value;

              // check whether type has a valid URI
              if (typeof typeURI === 'string' && typeURI.length > 5 && typeURI.match(/^http.*/)) {
                var newNode = {};
                newNode.uri = typeURI;
                newNode.type = 'type';
                newNode.value = 1;
                var typeId = Nodes.addNode(newNode);

                // connect this node with placeholder intermediate node until the relation is found
                var intermediateNode = {};
                intermediateNode.uri = Properties.PLACEHOLDER_PROP_URI;
                intermediateNode.type = 'datatypeProperty';
                intermediateNode.value = 1;
                var intermediateId = Nodes.addNode(intermediateNode);

                Properties.addProperty(classId, intermediateId, typeId, Properties.PLACEHOLDER_PROP_URI);

                RelationExtractor.requestClassTypeRelation(classId, intermediateId, typeId);
              } else {
                $log.warn(`[Referring Types] '${typeURI}' is not a valid URI! Data type was ignored.`);
              }
            }
          }
        } else {
          $log.debug(`[Referring Types] None found for instances of '${classURI}'.`);
        }

        Nodes.setTypesLoaded(classId);
      }, function (err) {
        if (err !== undefined && err.hasOwnProperty('status')) {
          if (err.status === 500 &&  err.hasOwnProperty('data') && err.data.search('estimated execution time') !== -1) {
            $log.debug('[Referring Types] Request would take to long!');
          }
        } else {
          $log.error(err);
        }
      }) // end of then()
      .finally(function () {
        Promises.removePromise(promiseId);
      });
  }; // end of requestReferringTypes()

} // end of TypeExtractor

export default typeExtractor;
