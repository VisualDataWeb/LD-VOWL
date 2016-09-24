import selectionGroupTemplate from './selection-group.html';

export default function selectionGroup() {

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

}
