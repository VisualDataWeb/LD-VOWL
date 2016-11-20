/**
 * @ngdoc directive
 * @name graphSettingsGroup
 * @module components.sidebar.groups.graphsettings
 *
 * @description
 * This is the directive for the graph settings including different edge lengths, coloring for external elements and
 * controls for the force directed layout of the graph.
 * 
 * @return {*}
 */
const graphSettingsGroup = function graphSettingsGroup() {

  return {
    restrict: 'E',
    scope: {},
    controller: 'GraphSettingsCtrl',
    controllerAs: 'graphSettings',
    bindToController: true,
    template: require('./graph-settings-group.html')
  };

};

export default graphSettingsGroup;
