import subclassPropSelectionTemplate from './subclass-prop-selection.html';

/**
 * @ngdoc directive
 * @name subclassPropertySelection
 *
 * @description
 *
 * This directive shows more details about a subclass relation selected in the graph.
 */
const subclassPropertySelection = function() {

  return {
    restrict: 'E',
    template: subclassPropSelectionTemplate
  };

};

export default subclassPropertySelection;
