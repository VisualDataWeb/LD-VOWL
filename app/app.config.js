import startTemplate from './components/start/start.html';
import settingsTemplate from './components/settings/settings.html';
import graphTemplate from './components/graph/graph.html';
import aboutTemplate from './components/about/about.html';

function routing($httpProvider, $routeProvider, $logProvider) {

  'ngInject';

  // set up http interceptor
  $httpProvider.interceptors.push('RequestCounter');
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  // apply changes in the next $digest cycle (around 10 milliseconds later, depending on the browser)
  $httpProvider.useApplyAsync();

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
    .when('/about', {
      title: 'About',
      template: aboutTemplate,
      controller: 'AboutCtrl',
      controllerAs: 'about'
    })
    .otherwise({
      redirectTo: '/'
    });

  // jshint ignore:start
  $logProvider.debugEnabled(__LOGGING__); // eslint-disable-line no-undef
  //jshint ignore:end

} // end of routing()

export default routing;
