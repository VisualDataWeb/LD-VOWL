'use strict';

function detailExtractor($http, $q, $log, QueryFactory, RequestConfig, Nodes, Promises) {

  'ngInject';

  /* jshint validthis: true */
  var that = this;

  /**
   * Request the rdfs:comment for the given uri and insert it into the right node.
   */
  that.requestCommentForClass = function (id) {
    var uri = Nodes.getURIById(id);

    var canceller = $q.defer();
    const promiseId = Promises.addPromise(canceller);

    var query = QueryFactory.getCommentQuery(uri);
    var requestURL = RequestConfig.getRequestURL();

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
