/**
 * @Name GraphSettingsCtrl
 *
 * @param Prefixes
 * @param $rootScope
 * @param $log
 */
function graphSettingsCtrl(Prefixes, $rootScope, $log) {

  'ngInject';

  /* jshint validthis: true */
  const graphSettings = this;

  graphSettings.differentColors = Prefixes.getDifferentColors();

  // length of edges between classes
  graphSettings.ccEdgeLength = 80;

  // length of edges between data type and class
  graphSettings.ctEdgeLength = 20;

  graphSettings.layoutPaused = false;

  graphSettings.setClassToClassEdgeLength = function (newValue) {
    if (newValue === undefined) {
      $log.error('[Graph Settings] New class to class edge length is undefined!');
      return;
    }
    graphSettings.ccEdgeLength = newValue;
    $rootScope.$broadcast('ccEdgeLength-changed', newValue);
  };

  graphSettings.setClassToDatatypeEdgeLength = function (newValue) {
    if (newValue === undefined) {
      $log.error('[Graph Settings] New class to data type edge length is undefined!');
      return;
    }
    graphSettings.ctEdgeLength = newValue;
    $rootScope.$broadcast('ctEdgeLength-changed', newValue);
  };

  /**
   * Toggle whether different colors should be used for classes and properties of external namespaces.
   */
  graphSettings.toggleDifferentColors = function () {
    graphSettings.differentColors = Prefixes.toggleDifferentColors();
  };

  /**
   * Toggle (pause/resume) the force-directed layout of the graph.
   */
  graphSettings.toggleLayout = function () {
    graphSettings.layoutPaused = !graphSettings.layoutPaused;
    $rootScope.$broadcast('toggled-layout', graphSettings.layoutPaused);
  };

}

export default graphSettingsCtrl;
