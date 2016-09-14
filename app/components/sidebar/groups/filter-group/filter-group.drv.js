export default function filterGroup() {

  return {
    restrict: 'E',
    scope: {},
    controller: 'FilterGroupCtrl',
    controllerAs: 'vm',
    template: require('./filter-group.html')
  };

}
