/* globals $ */
require('jquery-ui');

/**
 * @ngdoc directive
 * @name slider
 * @module components.sidebar
 *
 * @description
 *
 * The directive which uses a jQuery slider to adjust the length of different edges in the force directed graph.
 */
function slider($rootScope) {

  'ngInject';

  return {
    restrict: 'AE',
    scope: {
      value: '=model'
    },
    link: function (scope, element, attrs) {

      $(element).slider({
        range: false,
        value: scope[attrs.model],
        min: parseInt(attrs.min),
        max: parseInt(attrs.max),
        step: parseInt(attrs.step),

        slide: function (event, ui) {
          scope.$apply(function () {
            scope.value = parseInt(ui.value);
            $rootScope.$broadcast(attrs.id + '-changed', ui.value);
          });
        },

        // this function is needed to set the initial value, otherwise slider will always be at zero in the beginning
        create: function() {
          $(this).slider('value', scope.value);
        }
      });
    } // end pf link()
  }; // end of returned directive

} // end of slider()

export default slider;
