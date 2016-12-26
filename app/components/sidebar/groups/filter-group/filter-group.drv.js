/**
 * @ngdoc directive
 * @name filterGroup
 * @module components.sidebar.groups.filter
 *
 * @description
 *
 * This is the directive for the filter group. The following elements can be filtered out:
 *
 * - data types
 * - property loops
 * - subclass relations
 * - class disjointness nodes
 * 
 * @return {*}
 */
const filterGroup = function() {

  return {
    restrict: 'E',
    scope: {},
    controller: 'FilterGroupCtrl',
    controllerAs: 'vm',
    template: require('./filter-group.html')
  };

};

export default filterGroup;
