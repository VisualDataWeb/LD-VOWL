/**
 * @ngdoc type
 * @name GraphCtrl
 *
 * @param {$location} $location
 * @param {$log} $log
 * @param {TBoxExtractor} TBoxExtractor
 * @param {DetailExtractor} DetailExtractor
 * @param {RequestConfig} RequestConfig
 * @param {Data} Data
 * @param {View} View
 *
 * @ngInject
 */
function graphCtrl($location, $log, TBoxExtractor, DetailExtractor, RequestConfig, Data, View) {

  const vm = this;

  vm.selected = {
    uri: 'none',
    name: '',
    type: '',
    value: 0,
    props: []
  };

  vm.showSelection = false;

  vm.onClick = function(item) {
    vm.selected = item;
    DetailExtractor.requestCommentForClass(item.id);
    vm.showSelection = true;
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

      $log.warn(`[Graph] Endpoint URL is empty!`);

      // do not try to query an empty url
    } else {
      if (endpointURL !== RequestConfig.getEndpointURL()) {
        Data.clearAll();
        RequestConfig.setEndpointURL(endpointURL);
        Data.initMaps();
        View.reset();
        TBoxExtractor.clearClasses();
      }

      // insert endpoint URL if missing
      $location.search('endpointURL', endpointURL);

      $log.debug(`[Graph] Start to extract TBox information from '${endpointURL}'...`);

      TBoxExtractor.startTBoxExtraction();
    }
  };

  vm.startLoading();

}

export default graphCtrl;
