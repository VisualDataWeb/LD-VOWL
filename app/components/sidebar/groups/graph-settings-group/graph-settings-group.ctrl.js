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

  vm.ccEdgeLength = 80;
  vm.ctEdgeLength = 20;

  vm.layoutPaused = false;

  vm.toggleDifferentColors = function () {
    vm.differentColors = Prefixes.toggleDifferentColors();
  };

  vm.toggleLayout = function () {
    vm.layoutPaused = !vm.layoutPaused;
    $rootScope.$broadcast('toggled-layout', vm.layoutPaused);
  };

}

export default graphSettingsCtrl;
