/**
 * @ngdoc service
 * @name Filters
 *
 * @param {$cookies} $cookies
 * @param {$log} $log
 *
 * @ngInject
 */
function filters($cookies, $log) {

  const self = this;

  let includeLoops;
  let includeLiterals;
  let includeDisjointNode;
  let includeSubclassRelations;

  // TODO move into constant
  let cookiePrefix = 'ldvowl_';

  self.init = function () {
    let loopCookie = cookiePrefix + 'include_loops';
    includeLoops = self.getIncludeLoops() || true;
    $cookies.put(loopCookie, includeLoops);

    let literalCookie = cookiePrefix + 'include_literals';
    includeLiterals = self.getIncludeLiterals() || true;
    $cookies.put(literalCookie, includeLiterals);

    let disjointNodeCookie = cookiePrefix + 'include_disjoint_node';
    includeDisjointNode = self.getIncludeDisjointNode() || false;
    $cookies.put(disjointNodeCookie, includeDisjointNode);

    let subclassCookie = cookiePrefix + 'include_subclass_relations';
    includeSubclassRelations = self.getIncludeSubclassRelations() || true;
    $cookies.put(subclassCookie, includeSubclassRelations);
  };

  self.getIncludeLoops = function () {
    let cookieLoopFlag = $cookies.get(cookiePrefix + 'include_loops');

    if (cookieLoopFlag !== undefined) {
      includeLoops = cookieLoopFlag;
    }

    return (includeLoops === 'true');
  };

  self.toggleLoops = function () {
    let cookieName = cookiePrefix + 'include_loops';
    if (self.getIncludeLoops()) {
      $cookies.put(cookieName, 'false');
      $log.debug('[Filters] Disable loops.');
      return false;
    } else {
      $cookies.put(cookieName, 'true');
      $log.debug('[Filters] Enable loops');
      return true;
    }
  };

  self.getIncludeLiterals = function () {
    let cookieLiteralsFlag = $cookies.get(cookiePrefix + 'include_literals');

    if (cookieLiteralsFlag !== undefined) {
      includeLiterals = cookieLiteralsFlag;
    }

    return (includeLiterals === 'true');
  };

  self.toggleLiterals = function () {
    let cookieName = cookiePrefix + 'include_literals';
    if (self.getIncludeLiterals()) {
      $log.debug('[Filters] Disable Literals.');
      $cookies.put(cookieName, 'false');
      return false;
    } else {
      $cookies.put(cookieName, 'true');
      $log.debug('[Filters] Enable Literals');
      return true;
    }
  };

  self.getIncludeDisjointNode = function () {
    let cookieDisjointNodeFlag = $cookies.get(cookiePrefix + 'include_disjoint_node');

    if (cookieDisjointNodeFlag !== undefined) {
      includeDisjointNode = cookieDisjointNodeFlag;
    }

    return (includeDisjointNode === 'true');
  };

  self.toggleDisjointNode = function () {
    let cookieName = cookiePrefix + 'include_disjoint_node';
    if (self.getIncludeDisjointNode()) {
      $log.debug('[Filters] Disable disjoint node.');
      $cookies.put(cookieName, 'false');
      return false;
    } else {
      $log.debug('[Filters] Enable disjoint node.');
      $cookies.put(cookieName, 'true');
      return true;
    }
  };

  self.getIncludeSubclassRelations = function () {
    let cookieSubclassRelationFlag = $cookies.get(cookiePrefix + 'include_subclass_relations');

    if (cookieSubclassRelationFlag !== undefined) {
      includeSubclassRelations = cookieSubclassRelationFlag;
    }

    return (includeSubclassRelations === 'true');
  };

  self.toggleSubclassRelations = function () {
    let cookieName = cookiePrefix + 'include_subclass_relations';
    if (self.getIncludeSubclassRelations()) {
      $log.debug('[Filters] Disable subclass relations');
      $cookies.put(cookieName, 'false');
      return false;
    } else {
      $log.debug('[Filters] Enable subclass relations.');
      $cookies.put(cookieName, 'true');
      return true;
    }
  };

  self.init();

}

export default filters;
