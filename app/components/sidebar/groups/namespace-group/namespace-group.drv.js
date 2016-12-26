import namespaceGroupTemplate from './namespace-group.html';

/**
 * @ngdoc directive
 * @name namespaceGroup
 * @module components.sidebar.groups.namespace
 *
 * @description
 * This directive represents the accordion group showing the class namespaces.
 * 
 * @return {*}
 */
const namespaceGroup = function() {

  return {
    restrict: 'E',
    scope: {},
    controller: 'NamespaceGroupCtrl',
    controllerAs: 'vm',
    template: namespaceGroupTemplate
  };

};

export default namespaceGroup;
