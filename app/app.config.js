import startTemplate from './components/start/start.html';
import settingsTemplate from './components/settings/settings.html';
import graphTemplate from './components/graph/graph.html';

export default function routing($httpProvider, $routeProvider) {

  // set up http interceptor
  $httpProvider.interceptors.push('RequestCounter');
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // set up routes
  $routeProvider
    .when('/', {
      title: 'Start',
      template: startTemplate,
      controller: 'StartCtrl',
      controllerAs: 'start'
    })
    .when('/settings', {
      title: 'Settings',
      template: settingsTemplate,
      controller: 'SettingsCtrl',
      controllerAs: 'vm'
    })
    .when('/graph', {
      title: 'Graph',
      template: graphTemplate,
      controller: 'GraphCtrl',
      controllerAs: 'vm'
    })
    .otherwise({
      redirectTo: '/'
    });

} // end of export
