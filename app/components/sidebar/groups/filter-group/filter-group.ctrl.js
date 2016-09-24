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

  vm.toggleTypes = function () {
    vm.filterTypes = !Filters.toggleLiterals();
    if (!vm.filterTypes) {
      TBoxExtractor.extractDataTypes();
    }
  };

  vm.toggleLoops = function () {
    vm.filterLoops = !Filters.toggleLoops();
    if (!vm.filterLoops) {
      TBoxExtractor.extractRelationLoops();
    }
  };

  vm.toggleDisjointNode = function () {
    vm.filterDisjointNodes = !Filters.toggleDisjointNode();
  };

  vm.toggleSubclassRelations = function() {
    vm.includeSubclassRelations = !Filters.toggleSubclassRelations();
  };

}

export default filterGroupCtrl;
