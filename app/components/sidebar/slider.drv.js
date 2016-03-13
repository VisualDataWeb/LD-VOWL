/* globals $ */
require('jquery-ui');

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
            $rootScope.$broadcast(attrs.model + '-changed', ui.value);
          });
        }
      });
    } // end pf link()
  }; // end of returned directive

} // end of slider()

export default slider;
