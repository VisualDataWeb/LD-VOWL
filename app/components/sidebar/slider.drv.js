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
function slider() {

  'ngInject';

  return {
    restrict: 'AE',
    scope: true,
    controller: function () {},
    controllerAs: 'slider',
    bindToController: {
      value: '=model',
      onUpdate: '&'
    },
    link: function (scope, element, attrs, controller) {

      $(element).slider({
        range: false,
        value: controller.value,
        min: parseInt(attrs.min),
        max: parseInt(attrs.max),
        step: parseInt(attrs.step),

        slide: function (event, ui) {
          scope.$apply(function () {

            // new value must be wrapped in object to be used as parameter
            controller.onUpdate({newValue: ui.value});
          });
        },

        // this function is needed to set the initial value, otherwise slider will always be at zero in the beginning
        create: function() {
          $(this).slider('value', parseInt(controller.value));
        }
      });

    } // end pf link()
  }; // end of returned directive

} // end of slider()

export default slider;
