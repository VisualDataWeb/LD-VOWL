filters.$inject = ['$cookies', '$log'];

function filters($cookies, $log) {

  // TODO move into constant
  var cookiePrefix = "ldvowl_";

  var self = this;

  self.init = function () {
    var loopCookie = cookiePrefix + "include_loops";
    var includeLoops = self.getIncludeLoops() || true;
    $cookies.put(loopCookie, includeLoops);

    var literalCookie = cookiePrefix + "include_literals";
    var includeLiterals = self.getIncludeLiterals() || true;
    $cookies.put(literalCookie, includeLiterals);

    var disjointNodeCookie = cookiePrefix + "include_disjoint_node";
    var includeDisjointNode = self.getIncludeDisjointNode() || false;
    $cookies.put(disjointNodeCookie, includeDisjointNode);
  };

  self.getIncludeLoops = function () {
    return ($cookies.get(cookiePrefix + "include_loops") === 'true');
  };

  self.toggleLoops = function () {
    var cookieName = cookiePrefix + "include_loops";
    if (self.getIncludeLoops()) {
      $cookies.put(cookieName, "false");
      $log.debug("[Filters] Disable loops.");
      return false;
    } else {
      $cookies.put(cookieName, "true");
      $log.debug("[Filters] Enable loops");
      return true;
    }
  };

  self.getIncludeLiterals = function () {
    return ($cookies.get(cookiePrefix + "include_literals") === 'true');
  };

  self.toggleLiterals = function () {
    var cookieName = cookiePrefix + "include_literals";
    if (self.getIncludeLiterals()) {
      $log.debug("[Filters] Disable Literals.");
      $cookies.put(cookieName, "false");
      return false;
    } else {
      $cookies.put(cookieName, "true");
      $log.debug("[Filters] Enable Literals");
      return true;
    }
  };

  self.getIncludeDisjointNode = function () {
    return ($cookies.get(cookiePrefix + "include_disjoint_node") === 'true');
  };

  self.toggleDisjointNode = function () {
    var cookieName = cookiePrefix + "include_disjoint_node";
    if (self.getIncludeDisjointNode()) {
      $log.debug("[Filters] Disable disjoint node.");
      $cookies.put(cookieName, "false");
      return false;
    } else {
      $log.debug("[Filters] Enable disjoint node.");
      $cookies.put(cookieName, "true");
      return true;
    }
  };

  self.init();

}

export default filters;
