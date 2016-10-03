import noSelectionTemplate from './no-selection.html';

/**
 * @ngdoc directive
 * @name noSelection
 *
 * @description
 *
 * This directive is shown if no element is selected in the graph.
 */
const noSelection = function() {

  return {
    restrict: 'E',
    template: noSelectionTemplate
  };

};

export default noSelection;
