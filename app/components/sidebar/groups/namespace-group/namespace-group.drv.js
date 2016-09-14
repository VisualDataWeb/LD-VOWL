import namespaceGroupTemplate from './namespace-group.html';

export default function namespaceGroup() {

  return {
    restrict: 'E',
    scope: {},
    controller: 'NamespaceGroupCtrl',
    controllerAs: 'vm',
    template: namespaceGroupTemplate
  };

}
