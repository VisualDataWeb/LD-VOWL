/**
 * @ngdoc directive
 * @name graphSettingsGroup
 * @module components.sidebar.groups.graphsettings
 *
 * @description
 *
 * This is the directive for the graph settings including different edge lengths, coloring for external elements and
 * controls for the force directed layout of the graph.
 */
const graphSettingsGroup = function graphSettingsGroup() {

  return {
    restrict: 'E',
    controller: 'GraphSettingsCtrl',
    controllerAs: 'vm',
    template: require('./graph-settings-group.html')
  };

};

export default graphSettingsGroup;
