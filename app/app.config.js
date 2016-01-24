export default function routing($httpProvider, $routeProvider) {

  // set up http interceptor
  $httpProvider.interceptors.push('RequestCounter');
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // set up routes
  $routeProvider
    .when('/', {
      title: 'Start',
      templateUrl: 'components/start/start.html',
      controller: 'StartCtrl',
      controllerAs: 'start'
    })
    .when('/settings', {
      title: 'Settings',
      templateUrl: 'components/settings/settings.html',
      controller: 'SettingsCtrl',
      controllerAs: 'vm'
    })
    .when('/graph', {
      title: 'Graph',
      templateUrl: 'components/graph/graph.html',
      controller: 'GraphCtrl',
      controllerAs: 'vm'
    })
    .otherwise({
      redirectTo: '/'
    });
}
