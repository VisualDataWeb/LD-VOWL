function endpointGroupCtrl($scope, $location, Requests, RequestConfig) {

  'ngInject';

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
