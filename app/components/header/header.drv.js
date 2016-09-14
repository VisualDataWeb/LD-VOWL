export default function header() {

  return {
    restrict: 'E',
    scope: {},
    controller: 'HeaderCtrl',
    controllerAs: 'header',
    bindToController: {
      appVersion: '@'
    },
    template: require('./header.html')
  };

}
