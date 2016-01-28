/**
 * Created by marc on 15.12.15.
 */

require('jquery-ui');

module.exports = function ($rootScope) {

  return {
    restrict: 'AE',
    scope: {
      value: "=model"
    },
    link: function (scope, element, attrs) {

      var setModel = function (value) {
        scope.model = value;
      };

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
    }
  };

};