/**
 * @ngdoc type
 * @name GraphSettingsCtrl
 *
 * @param {$rootScope} $rootScope
 * @param {$log} $log
 * @param {Prefixes} Prefixes
 * @param {Links} Links
 *
 * @ngInject
 */
function graphSettingsCtrl($rootScope, $log, Prefixes, Links) {

  const graphSettings = this;

  graphSettings.differentColors = Prefixes.getDifferentColors();

  // length of edges between classes
  graphSettings.ccEdgeLength = Links.getClassToClassDistance();

  // length of edges between data type and class
  graphSettings.ctEdgeLength = Links.getClassToDatatyoeDistance();

  graphSettings.layoutPaused = false;

  graphSettings.setClassToClassEdgeLength = function (newValue) {
    if (newValue === undefined) {
      $log.error('[Graph Settings] New class to class edge length is undefined!');
      return;
    }
    graphSettings.ccEdgeLength = newValue;
    Links.setClassToClassDistance(newValue);

    // node link graph must be informed
    $rootScope.$broadcast('edge-length-changed', newValue);
  };

  graphSettings.setClassToDatatypeEdgeLength = function (newValue) {
    if (newValue === undefined) {
      $log.error('[Graph Settings] New class to data type edge length is undefined!');
      return;
    }
    graphSettings.ctEdgeLength = newValue;
    Links.setClassToDatatypeDistance(newValue);

    // node link graph must be informed
    $rootScope.$broadcast('edge-length-changed', newValue);
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
