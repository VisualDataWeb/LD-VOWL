/**
 * @Name TypeExtractor
 * TODO rename to DataTypeExtractor
 *
 * @param {$http} $http
 * @param {$q} $q
 * @param {$log} $log
 * @param {RequestConfig} RequestConfig
 * @param {QueryFactory} QueryFactory
 * @param {Nodes} Nodes
 * @param {Properties} Properties
 * @param {RelationExtractor} RelationExtractor
 * @param {Promises} Promises
 *
 * @ngInject
 */
function typeExtractor($http, $q, $log, RequestConfig, QueryFactory, Nodes, Properties, RelationExtractor, Promises) {

  var that = this;

  that.requestReferringTypes = function (classId) {

    var canceller = $q.defer();
    const promiseId = Promises.addPromise(canceller);

    var classURI = Nodes.getURIById(classId);
    const query = QueryFactory.getInstanceReferringTypesQuery(classURI, 5);
    var requestURL = RequestConfig.getRequestURL();

    // avoid loading types multiple times
    if (Nodes.getTypesLoaded(classId)) {
      $log.debug(`[Referring Types] Types for '${classURI}' are already loaded!`);
      return;
    }

    $log.debug(`[Referring Types] Send requests for types referring to instances of '${classURI}'...`);

    $http.get(requestURL, RequestConfig.forQuery(query, canceller))
      .then(function handleExtractedReferringTypes(response) {
        if (response === undefined || response.data === undefined || response.data.results === undefined) {
          $log.warn('[Referring Types] No results');
          return;
        }

        const bindings = response.data.results.bindings;

        if (bindings !== undefined && bindings.length > 0) {
          $log.debug(`[Referring Types] Found ${bindings.length} for '${classURI}'.`);

          for (let i = 0; i < bindings.length; i++) {
            if (bindings[i].valType !== undefined && bindings[i].valType.hasOwnProperty('value')) {

              let typeURI = bindings[i].valType.value;

              // check whether type has a valid URI
              if (typeof typeURI === 'string' && typeURI.length > 5 && typeURI.match(/^http.*/)) {
                const newDataTypeNode = {
                  uri: typeURI,
                  type: 'type',
                  value: 1
                };

                // a data type should only occur once per class, so it must be checked whether there is already a
                // connected node BEFORE adding a new one
                const typeId = Nodes.addDatatypeForClass(newDataTypeNode, classId);

                if (typeId !== '') {
                  // connect this node with placeholder intermediate node until the relation is found
                  const intermediateNode = {
                    uri: Properties.PLACEHOLDER_PROP_URI,
                    type: 'datatypeProperty',
                    value: 1

                  };
                  const intermediateId = Nodes.addNode(intermediateNode);

                  Properties.addProperty(classId, intermediateId, typeId, Properties.PLACEHOLDER_PROP_URI);

                  RelationExtractor.requestClassTypeRelation(classId, intermediateId, typeId);
                } else {
                  $log.warn(`[Referring Types] Data type '${typeURI}' is already connected to class '${classId}'.`);
                }
              } else {
                $log.warn(`[Referring Types] '${typeURI}' is not a valid URI! Data type was ignored.`);
              }
            }
          }
        } else {
          $log.debug(`[Referring Types] None found for instances of '${classURI}'.`);
        }

        Nodes.setTypesLoaded(classId);
      }, function handleErrorExtractingReferringTypes(err) {
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
