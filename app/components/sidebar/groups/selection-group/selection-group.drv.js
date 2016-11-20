import selectionGroupTemplate from './selection-group.html';

/**
 * @ngdoc directive
 * @name selectionGroup
 * 
 * @description
 * This directive represents the selection group in the sidebar accordion which shows details about the selected graph
 * elements.
 * @return {*}
 */
const selectionGroup = function() {

  return {
    restrict: 'E',
    scope: {
      selected: '=selectedItem'
    },
    bindToController: true,
    controller: 'SelectionGroupCtrl',
    controllerAs: 'vm',
    template: selectionGroupTemplate
  };

};

export default selectionGroup;
