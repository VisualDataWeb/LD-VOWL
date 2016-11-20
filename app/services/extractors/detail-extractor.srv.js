/**
 * @ngdoc service
 * @name DetailExtractor
 *
 * @param {$http} $http
 * @param {$q} $q
 * @param {$log} $log
 * @param {QueryFactory} QueryFactory
 * @param {RequestConfig} RequestConfig
 * @param {Nodes} Nodes
 * @param {Promises} Promises
 *
 * @ngInject
 */
function detailExtractor($http, $q, $log, QueryFactory, RequestConfig, Nodes, Promises) {

  const that = this;

  /**
   * Request the rdfs:comment for the node with the given id and insert it into the right node.
   * 
   * @param {string} id - the id of the class node
   */
  that.requestCommentForClass = function (id) {
    const uri = Nodes.getURIById(id);

    const canceller = $q.defer();
    const promiseId = Promises.addPromise(canceller);

    const query = QueryFactory.getCommentQuery(uri);
    const requestURL = RequestConfig.getRequestURL();

    $http.get(requestURL, RequestConfig.forQuery(query, canceller))
      .then(function handleExtractedComment(response) {
        var bindings = response.data.results.bindings;

        if (bindings.length > 0) {
          var newComment = bindings[0].comment;
          if (newComment !== undefined && newComment.hasOwnProperty('value')) {
            Nodes.insertComment(id, newComment.value);
          } else {
            $log.error(`[DetailExtractor] Error parsing comment for '${uri}'.`);
          }
        } else {
          $log.debug(`[DetailExtractor] No Comment found for '${uri}'.`);
        }
    }, function (err) {
      $log.error(err);
    })
    .finally(function () {
      Promises.removePromise(promiseId);
    });
  }; // end of requestCommentForClass()

} // end of detailExtractor

export default detailExtractor;
