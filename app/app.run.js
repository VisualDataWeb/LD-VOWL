function runBlock($rootScope) {

  'ngInject';

  $rootScope.$on('$routeChangeSuccess', function (event, current) {
    if (current && current.$$route && current.$$route.title) {
      $rootScope.title = current.$$route.title;
    }
  });

}

export default runBlock;
