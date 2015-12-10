'use strict';

module.exports = function ($scope, $log, Filters, ClassExtractor, RelationExtractor, TypeExtractor, DetailExtractor,
                           RequestConfig, Requests) {

  var vm = this;

  vm.numberOfProps = 5;

  vm.extractTypes = Filters.getIncludeLiterals();
  vm.includeLoops = Filters.getIncludeLoops();

  vm.endpointURL = RequestConfig.getEndpointURL();
  vm.data = {};
  vm.data.nodes = [];

  vm.classes = [];

  // TODO avoid $scope, use controllerAs syntax instead
  $scope.selected = {
    uri: 'none',
    name: '',
    type: '',
    value: 0,
    props: []
  };

  $scope.showSelection = false;

  $scope.pendingRequests = Requests.getPendingRequests();
  $scope.failedRequests = Requests.getFailedRequests();
  $scope.successfulRequests = Requests.getSuccessfulRequests();

  $scope.onClick = function(item) {
    $scope.$apply(function () {
      if (item.hasOwnProperty('uri')) {
          vm.data.selected  = item.uri;
          $scope.selected = item;
          DetailExtractor.requestCommentForClass(item.uri);
          $scope.showSelection = true;
        } else {
          $scope.selected.uri = 'none';
        }
    });
  };

  $scope.$on("pending-requests-changed", function(event, pending) {
    $scope.pendingRequests = pending;
    $scope.successfulRequests = Requests.getSuccessfulRequests();
    $scope.failedRequests = Requests.getFailedRequests();
  });

  vm.incNumberOfProps = function () {
    vm.numberOfProps += 5;
  };

  vm.toggleLiterals = function () {
    vm.extractTypes = Filters.toggleLiterals();
    if (vm.extractTypes) {
      vm.loadTypes();
    }
  };

  vm.loadTypes = function () {
    $log.info("[Graph] Send requests for types...");
    for (var i = 0; i < vm.classes.length; i++) {
      if (vm.classes[i].class !== undefined) {
        TypeExtractor.requestReferringTypes(vm.classes[i].class.value);
      }
    }
  };

  vm.toggleLoops = function () {
    vm.includeLoopse = Filters.toggleLoops();
    if (vm.includeLoops) {
      vm.loadLoops();
    }
  };

  vm.loadLoops = function () {
    for (var i = 0; i < vm.classes.length; i++) {
      var currentClass = vm.classes[i];
      if (currentClass.class !== undefined && currentClass.class.hasOwnProperty("value")) {
        RelationExtractor.requestClassClassRelation(currentClass.class.value, currentClass);
      }
    }
  };

  vm.startLoading = function () {
    ClassExtractor.requestClasses().then(function (classes) {

      vm.classes = classes;

      vm.loadTypes();

      console.log("[Graph] Send requests for relations.");

      // search for relations between classes
      for (var end = 0; end < classes.length; end++) {
        for (var start = 0; start < classes.length; start++) {
          if (vm.includeLoops || start !== end) {
            var origin = classes[start];
            var target = classes[end];
            RelationExtractor.requestClassClassRelation(origin, target, 10, 0);
          }
        }
      }
    });
  };

  vm.startLoading();

};
