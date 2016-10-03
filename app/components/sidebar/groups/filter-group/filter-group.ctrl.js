/**
 * @Name FilterGroupCtrl
 *
 * @param Filters
 * @param TBoxExtractor
 */
function filterGroupCtrl(Filters, TBoxExtractor) {

  'ngInject';

  const vm = this;

  vm.filterTypes = !Filters.getIncludeLiterals();
  vm.filterLoops = !Filters.getIncludeLoops();
  vm.filterDisjointNodes = !Filters.getIncludeDisjointNode();
  vm.filterSubclassRelations = !Filters.getIncludeSubclassRelations();

  // jshint ignore:start
  vm.showEndpointUrl = __SHOW_ENDPOINT__; // eslint-disable-line no-undef
  // jshint ignore:end

  /**
   * Toggle whether data types should be shown in the graph.
   */
  vm.toggleTypes = function () {
    vm.filterTypes = !Filters.toggleLiterals();
    if (!vm.filterTypes) {
      TBoxExtractor.extractDataTypes();
    }
  };

  /**
   * Toggle whether property loops should be shown in the graph.
   */
  vm.toggleLoops = function () {
    vm.filterLoops = !Filters.toggleLoops();
    if (!vm.filterLoops) {
      TBoxExtractor.extractRelationLoops();
    }
  };

  /**
   * Toggle whether disjoint nodes should be shown in the graph.
   */
  vm.toggleDisjointNode = function () {
    vm.filterDisjointNodes = !Filters.toggleDisjointNode();
  };

  /**
   * Toggle whether sub class relations should be shown in the graph.
   */
  vm.toggleSubclassRelations = function() {
    vm.includeSubclassRelations = !Filters.toggleSubclassRelations();
  };

}

export default filterGroupCtrl;
