'use strict';

detailExtractor.$inject = ['$http', '$log', 'QueryFactory', 'RequestConfig', 'Nodes'];

// TODO make this a ES6 class
function detailExtractor($http, $log, QueryFactory, RequestConfig, Nodes) {

  var that = this;

  /**
   * Request the rdfs:comment for the given uri and insert it into the right node.
   */
  that.requestCommentForClass = function (id) {
    var uri = Nodes.getURIById(id);

    var query = QueryFactory.getCommentQuery(uri);
    var requestURL = RequestConfig.getRequestURL();

    $http.get(requestURL, RequestConfig.forQuery(query))
    .then(function (response) {
      var bindings = response.data.results.bindings;

      if (bindings.length > 0) {
        var newComment = bindings[0].comment;
        if (newComment !== undefined && newComment.hasOwnProperty('value')) {
          Nodes.insertComment(id, newComment.value);
        } else {
          $log.error("[DetailExtractor] Error parsing comment for '" + uri + "'.");
        }
      } else {
        $log.debug("[DetailExtractor] No Comment found for '" + uri + "'.");
      }
    }, function (err) {
      $log.error(err);
    });
  };

}

export default detailExtractor;
