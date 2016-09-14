/**
 * @Name FilterGroupCtrl
 *
 * @param Filters
 * @param SchemaExtractor
 */
function filterGroupCtrl(Filters, SchemaExtractor) {

  'ngInject';

  const vm = this;

  vm.numberOfProps = 5;

  vm.filterTypes = !Filters.getIncludeLiterals();
  vm.filterLoops = !Filters.getIncludeLoops();
  vm.filterDisjointNodes = !Filters.getIncludeDisjointNode();
  vm.filterSubclassRelations = !Filters.getIncludeSubclassRelations();

  // jshint ignore:start
  vm.showEndpointUrl = __SHOW_ENDPOINT__; // eslint-disable-line no-undef
  // jshint ignore:end


  vm.incNumberOfProps = function () {
    vm.numberOfProps += 5;
  };

  vm.toggleTypes = function () {
    vm.filterTypes = !Filters.toggleLiterals();
    if (!vm.filterTypes) {
      SchemaExtractor.extractDataTypes();
    }
  };

  vm.toggleLoops = function () {
    vm.filterLoops = !Filters.toggleLoops();
    if (!vm.filterLoops) {
      SchemaExtractor.extractRelationLoops();
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
