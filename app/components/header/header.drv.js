/**
 * @ngdoc directive
 * @name header
 * @module components.header
 *
 * @description
 *
 * The directive showing name and version of LD-VOWL.
 * 
 * @return {*}
 */
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
