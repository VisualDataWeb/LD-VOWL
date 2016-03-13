function runBlock($rootScope) {

  'ngInject';

  $rootScope.$on('$routeChangeSuccess', function (event, current) {
    $rootScope.title = current.$$route.title;
  });

}

export default runBlock;
