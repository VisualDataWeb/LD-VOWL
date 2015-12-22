'use strict';

module.exports = function ($http, QueryFactory, RequestConfig, Nodes) {

  var that = this;

  /**
   * Request the rdfs:comment for the given uri and insert it into the right node.
   */
  that.requestCommentForClass = function (id) {
    var uri = Nodes.getURIById(id);

    var query = QueryFactory.getCommentQuery(uri);
    var endpointURL = RequestConfig.getEndpointURL();

    $http.get(endpointURL, RequestConfig.forQuery(query))
    .then(function (response) {
      var bindings = response.data.results.bindings;

      if (bindings.length > 0) {
        var newComment = bindings[0].comment;
        if (newComment !== undefined && newComment.hasOwnProperty('value')) {
          Nodes.insertComment(id, newComment.value);
        } else {
          console.error("[DetailExtractor] Error parsing comment for '" + uri + "'.");
        }
      } else {
        console.log("[DetailExtractor] No Comment for " + uri + ".");
      }
    }, function (err) {
      console.error(err);
    });
  };

};
