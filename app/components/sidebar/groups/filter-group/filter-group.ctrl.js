/**
 * @Name FilterGroupCtrl
 *
 * @param {Filters} Filters
 * @param {TBoxExtractor} TBoxExtractor
 *
 * @ngInject
 */
function filterGroupCtrl(Filters, TBoxExtractor) {

  const vm = this;

  vm.filterDataTypes = !Filters.getIncludeDataTypes();
  vm.filterLoops = !Filters.getIncludeLoops();
  vm.filterDisjointNodes = !Filters.getIncludeDisjointNode();
  vm.filterSubclassRelations = !Filters.getIncludeSubclassRelations();

  vm.showEndpointUrl = __SHOW_ENDPOINT__; // eslint-disable-line no-undef

  /**
   * Toggle whether data types should be shown in the graph.
   */
  vm.toggleDataTypes = function () {
    vm.filterDataTypes = !Filters.toggleDataTypes();
    if (!vm.filterDataTypes) {
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
