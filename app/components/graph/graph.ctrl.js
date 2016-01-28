'use strict';

module.exports = function ($scope, $q, $log, Filters, ClassExtractor, RelationExtractor, TypeExtractor, DetailExtractor,
                           RequestConfig, Requests, Prefixes) {

  var vm = this;

  vm.numberOfProps = 5;

  vm.extractTypes = Filters.getIncludeLiterals();
  vm.includeLoops = Filters.getIncludeLoops();
  vm.showDisjunctNode = false;
  vm.differentColors = Prefixes.getDifferentColors();

  vm.endpointURL = RequestConfig.getEndpointURL();
  vm.data = {};
  vm.data.nodes = [];

  vm.classes = [];

  $scope.ccEdgeLength = 80;
  $scope.ctEdgeLength = 20;

  $scope.prefixes = Prefixes.getPrefixes();

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
      $scope.selected = item;
      DetailExtractor.requestCommentForClass(item.id);
      $scope.showSelection = true;
    });
  };

  $scope.$on("pending-requests-changed", function(event, pending) {
    $scope.pendingRequests = pending;
    $scope.successfulRequests = Requests.getSuccessfulRequests();
    $scope.failedRequests = Requests.getFailedRequests();
  });

  $scope.$on('prefixes-changed', function () {
    $log.debug('[Graph] Prefixes have changed, update them...');
    $scope.prefixes = Prefixes.getPrefixes();
  });

  vm.incNumberOfProps = function () {
    vm.numberOfProps += 5;
  };

  vm.toggleTypes = function () {
    vm.extractTypes = Filters.toggleLiterals();
    if (vm.extractTypes) {
      vm.loadTypes();
    }
  };

  vm.toggleLoops = function () {
    vm.includeLoops = Filters.toggleLoops();
    if (vm.includeLoops) {
      vm.loadLoops();
    }
  };

  vm.toggleDisjunctNode = function () {
    //TODO not implemented yet!
  };

  vm.toggleDifferentColors = function () {
    vm.differentColors = Prefixes.toggleDifferentColors();
  };

  /**
   * Load loop relations, this means class-class relation from one class to itself.
   */
  vm.loadLoops = function () {
    for (var i = 0; i < vm.classes.length; i++) {
      var currentClass = vm.classes[i];
      if (currentClass.class !== undefined && currentClass.class.hasOwnProperty("value")) {
        RelationExtractor.requestClassClassRelation(currentClass.class.value, currentClass);
      }
    }
  };

  /**
   * Start loading data requesting classes. For each class request referring types and search class-class relations.
   */
  vm.startLoading = function () {
    ClassExtractor.requestClasses().then(function (newClasses) {

      // merge existing and new classes
      if (newClasses.length === 0) {
        $log.debug("[Graph] No new classes!");
      } else {
        for (var i = 0; i < newClasses.length; i++) {
          vm.classes.push(newClasses[i]);
        }
      }

      var promises = [];
      for (var end = 0; end < vm.classes.length; end++) {
        for (var start = 0; start < end; start++) {
          promises.push(RelationExtractor.requestClassEquality(vm.classes[start], vm.classes[end]));
        }
      }

      // after class equality is checked for all pairs, types and relations can be loaded
      $q.allSettled(promises).then(function (data) {

        $log.debug("[Graph] Now all should be settled!");

        // remove merged class for class list to avoid further request for these classes
        for (var i = 0; i < data.length; i++) {
          if (data[i]['state'] === 'fulfilled') {
            var indexToRemove = vm.classes.indexOf(data[i]['value']);

            if (indexToRemove !== -1) {
              vm.classes.splice(indexToRemove, 1);
              $log.debug("[Graph] Removed '" + data[i]['value'] + "' from class list.");
            } else {
              $log.error("[Graph] Unable to remove '" + data[i]['value'] + "' from class list, class doesn't exist!");
            }
          }
        }

        // optionally extract types referring to instances of the classes
        if (vm.extractTypes) {
          vm.loadTypes();
        }

        vm.loadRelations();
      });
    });
  };

  /**
   * Load referring types for each class.
   */
  vm.loadTypes = function () {
    $log.debug("[Graph] Loading types..." + vm.classes.length);
    for (var i = 0; i < vm.classes.length; i++) {
      TypeExtractor.requestReferringTypes(vm.classes[i]);
    }
  };

  /**
   * Load relations for each pair of classes.
   */
  vm.loadRelations = function () {

    $log.debug("[Graph] Send requests for relations...");

    // for each pair of classes search relation and check equality
    for (var end = 0; end < vm.classes.length; end++) {
      for (var start = 0; start < vm.classes.length; start++) {
        if (vm.includeLoops || start !== end) {
          var origin = vm.classes[start];
          var target = vm.classes[end];

          RelationExtractor.requestClassClassRelation(origin, target, 10, 0);
        }
      }
    }
  };

  /**
   * Update the prefixes to the current ones
   */
  vm.updatePrefixes = function () {
    Prefixes.setPrefixes($scope.prefixes);
  };

  vm.startLoading();

};
