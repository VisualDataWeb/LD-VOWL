export default function graphSettingsGroup() {

  return {
    restrict: 'E',
    controller: 'GraphSettingsCtrl',
    controllerAs: 'vm',
    template: require('./graph-settings-group.html')
  };

}
