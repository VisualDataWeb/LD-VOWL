runBlock.$inject = ['$rootScope'];

function runBlock($rootScope) {

  $rootScope.$on('$routeChangeSuccess', function (event, current) {
    $rootScope.title = current.$$route.title;
  });

}

export default runBlock;
