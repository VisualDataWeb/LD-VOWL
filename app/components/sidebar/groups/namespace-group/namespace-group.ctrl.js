function namespaceGroupCtrl($scope, $log, Prefixes) {

  'ngInject';

  const vm = this;

  vm.numberOfPrefixes = 3;

  vm.prefixes = Prefixes.getPrefixes();

  $scope.$on('prefixes-changed', function () {
    $log.debug('[Namespaces] Prefixes have changed, update them...');
    vm.prefixes = Prefixes.getPrefixes();
  });

  /**
   * Update the prefixes to the current ones
   */
  vm.updatePrefixes = function () {
    Prefixes.setPrefixes(vm.prefixes);
  };

  /**
   * Increase the number of prefixes to be shown.
   */
  vm.incNumberOfPrefixes = function () {
    vm.numberOfPrefixes += 5;
  };

}

export default namespaceGroupCtrl;
