/**
 * @ngdoc service
 * @name Filters
 *
 * @param {$log} $log
 * @param {Storage} Storage
 *
 * @ngInject
 */
function filters($log, Storage) {

  const self = this;

  const DATATYPE_FLAG_NAME = 'include_data_types';
  const LOOP_FLAG_NAME = 'include_loops';
  const DISJOINT_NODE_FLAG_NAME = 'include_disjoint_node';
  const SUBCLASS_FLAG_NAME = 'include_subclass_relations';

  let includeLoops;
  let includeDataTypes;
  let includeDisjointNode;
  let includeSubclassRelations;

  self.init = function () {
    includeLoops = Storage.getItem(LOOP_FLAG_NAME) || 'true';
    Storage.setItem(LOOP_FLAG_NAME, includeLoops);

    includeDataTypes = Storage.getItem(DATATYPE_FLAG_NAME) || 'true';
    Storage.setItem(DATATYPE_FLAG_NAME, includeDataTypes);

    includeDisjointNode = Storage.getItem(DISJOINT_NODE_FLAG_NAME) || 'false';
    Storage.setItem(DISJOINT_NODE_FLAG_NAME, includeDisjointNode);

    includeSubclassRelations = Storage.getItem(SUBCLASS_FLAG_NAME) || 'true';
    Storage.setItem(SUBCLASS_FLAG_NAME, includeSubclassRelations);
  };

  self.getIncludeLoops = function () {
    return (includeLoops === 'true');
  };

  /**
   * Toggle property loops and return new setting.
   *
   * @return {boolean} true if property loops are shown, false otherwise
   */
  self.toggleLoops = function () {
    includeLoops = (self.getIncludeLoops()) ? 'false' : 'true';
    Storage.setItem(LOOP_FLAG_NAME, includeLoops);

    $log.debug(`[Filters] Property loops are now ${self.getIncludeLoops() ? 'shown' : 'hidden' }.`);

    return self.getIncludeLoops();
  };

  self.getIncludeDataTypes = function () {
    return (includeDataTypes === 'true');
  };

  /**
   * Toggles data types and returns new setting.
   *
   * @return {boolean} true if data types are included, false otherwise
   */
  self.toggleDataTypes = function () {
    includeDataTypes = (self.getIncludeDataTypes()) ? 'false' : 'true';
    Storage.setItem(DATATYPE_FLAG_NAME, includeDataTypes);

    $log.debug(`[Filters] Data types are now ${self.getIncludeLoops() ? 'shown' : 'hidden'}.`);

    return self.getIncludeDataTypes();
  };

  self.getIncludeDisjointNode = function () {
    return (includeDisjointNode === 'true');
  };

  /**
   * Toggles disjoint nodes and returns new setting.
   *
   * @return {boolean} true if disjoint nodes are included, false otherwise
   */
  self.toggleDisjointNode = function () {
    includeDisjointNode = self.getIncludeDisjointNode() ? 'false' : 'true';
    Storage.setItem(DISJOINT_NODE_FLAG_NAME, includeDisjointNode);

    $log.debug(`[Filters] Disjoint nodes are now ${self.getIncludeDisjointNode() ? 'shown' : 'hidden'}.`);

    return self.getIncludeDisjointNode();
  };

  self.getIncludeSubclassRelations = function () {
    return (includeSubclassRelations === 'true');
  };

  /**
   * Toggles subclass relations and returns new setting.
   *
   * @return {boolean} true if subclass relations are included, false otherwise
   */
  self.toggleSubclassRelations = function () {
    includeSubclassRelations = self.getIncludeSubclassRelations() ? 'false' : 'true';
    Storage.setItem(SUBCLASS_FLAG_NAME, includeSubclassRelations);

    $log.debug(`[Filters] Subclass relations are now ${self.getIncludeSubclassRelations() ? 'shown' : 'hidden'}.`);

    return self.getIncludeSubclassRelations();
  };

  self.init();

}

export default filters;
