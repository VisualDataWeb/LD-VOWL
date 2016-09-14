/**
 * @Name GraphCtrl
 *
 * @param $scope
 * @param {$location} $location
 * @param {$log} $log
 * @param TBoxExtractor
 * @param DetailExtractor
 * @param RequestConfig
 * @param Data
 * @param View
 */
function graphCtrl($scope, $location, $log, TBoxExtractor, DetailExtractor, RequestConfig, Data, View) {

  'ngInject';

  /* jshint validthis: true */
  const vm = this;

  vm.data = {};
  vm.data.nodes = [];

  // TODO avoid $scope, use controllerAs syntax instead
  $scope.selected = {
    uri: 'none',
    name: '',
    type: '',
    value: 0,
    props: []
  };

  $scope.showSelection = false;

  $scope.onClick = function(item) {
    $scope.$apply(function () {
      $scope.selected = item;
      DetailExtractor.requestCommentForClass(item.id);
      $scope.showSelection = true;
    });
  };

  /**
   * Stop the extraction by rejecting all promises.
   */
  vm.stopLoading = function () {
    TBoxExtractor.stopTBoxExtraction();
  };

  /**
   * First clear all loaded data, then restart Loading
   */
  vm.restartLoading = function () {
    TBoxExtractor.restartTBoxExtraction();
  };

  /**
   * Start loading data requesting classes. For each class request referring types and search class-class relations.
   */
  vm.startLoading = function () {
    let requestedEndpoint = $location.search()['endpointURL'];
    let endpointURL = (requestedEndpoint !== undefined) ? requestedEndpoint : RequestConfig.getEndpointURL();

    if (endpointURL === undefined || endpointURL === '') {
      Data.clearAll();
      RequestConfig.setEndpointURL();
      Data.initMaps();
      View.reset();

      // do not try to query an empty url
    } else {
      if (endpointURL !== RequestConfig.getEndpointURL()) {
        Data.clearAll();
        RequestConfig.setEndpointURL(endpointURL);
        Data.initMaps();
        View.reset();
      }

      // insert endpoint URL if missing
      $location.search('endpointURL', endpointURL);

      TBoxExtractor.startTBoxExtraction();
    }
  };

  vm.startLoading();

}

export default graphCtrl;
