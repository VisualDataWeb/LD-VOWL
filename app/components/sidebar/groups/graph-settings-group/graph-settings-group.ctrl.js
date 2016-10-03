/**
 * @Name GraphSettingsCtrl
 *
 * @param Prefixes
 * @param $rootScope
 */
function graphSettingsCtrl(Prefixes, $rootScope) {

  'ngInject';

  /* jshint validthis: true */
  const vm = this;

  vm.differentColors = Prefixes.getDifferentColors();

  // length of edges between classes
  vm.ccEdgeLength = 80;

  // length of edges between data type and class
  vm.ctEdgeLength = 20;

  vm.layoutPaused = false;

  /**
   * Toggle whether different colors should be used for classes and properties of external namespaces.
   */
  vm.toggleDifferentColors = function () {
    vm.differentColors = Prefixes.toggleDifferentColors();
  };

  /**
   * Toggle (pause/resume) the force-directed layout of the graph.
   */
  vm.toggleLayout = function () {
    vm.layoutPaused = !vm.layoutPaused;
    $rootScope.$broadcast('toggled-layout', vm.layoutPaused);
  };

}

export default graphSettingsCtrl;
