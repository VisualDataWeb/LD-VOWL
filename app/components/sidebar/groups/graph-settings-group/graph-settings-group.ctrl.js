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
  graphSettings.ctEdgeLength = Links.getClassToDatatypeDistance();

  graphSettings.layoutPaused = false;

  graphSettings.updateClassToClassLength = function() {
    const newLength = parseInt(graphSettings.ccEdgeLength);
    Links.setClassToClassDistance(newLength);

    // node link graph must be informed
    $rootScope.$broadcast('edge-length-changed', newLength);
  };

  graphSettings.updateClassToDatatypeLength = function() {  
    const newLength = parseInt(graphSettings.ctEdgeLength);
    Links.setClassToDatatypeDistance(newLength);

    // node link graph must be informed
    $rootScope.$broadcast('edge-length-changed', newLength);
  };

  /**
   * Toggle whether different colors should be used for classes and properties of external namespaces.
   */
  graphSettings.toggleDifferentColors = function () {
    graphSettings.differentColors = Prefixes.toggleDifferentColors();
    $log.debug(`[GraphSettings] ${graphSettings.differentColors ? 'Use' : "Don't use"} different colors in graph.`);
  };

  /**
   * Toggle (pause/resume) the force-directed layout of the graph.
   */
  graphSettings.toggleLayout = function () {
    graphSettings.layoutPaused = !graphSettings.layoutPaused;
    $rootScope.$broadcast('toggled-layout', graphSettings.layoutPaused);
    $log.debug(`[GraphSettings] ${graphSettings.layoutPaused ? 'Pause' : 'Resume'} force-directed layout.`);
  };

}

export default graphSettingsCtrl;
