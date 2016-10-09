/**
 * @ngdoc type
 * @name EndpointGroupCtrl
 *
 * @param $scope
 * @param $location
 * @param Requests
 * @param RequestConfig
 *
 * @ngInject
 */
function endpointGroupCtrl($scope, $location, Requests, RequestConfig) {

  const vm = this;

  vm.showEndpointUrl = true;

  vm.requestedEndpoint = $location.search()['endpointURL'];
  vm.endpointURL = (vm.requestedEndpoint !== undefined) ? vm.requestedEndpoint : RequestConfig.getEndpointURL();

  vm.pendingRequests = Requests.getPendingRequests();
  vm.failedRequests = Requests.getFailedRequests();
  vm.successfulRequests = Requests.getSuccessfulRequests();
  vm.errorStatus = Requests.getStatus();

  $scope.$on('pending-requests-changed', function(event, pending) {
    vm.pendingRequests = pending;
    vm.successfulRequests = Requests.getSuccessfulRequests();
    vm.failedRequests = Requests.getFailedRequests();
    vm.errorStatus = Requests.getStatus();
  });

}

export default endpointGroupCtrl;
