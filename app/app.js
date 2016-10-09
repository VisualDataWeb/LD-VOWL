import angular from 'angular';

// import dependencies
import components from './components/components.module';
import filters from './filters/filters.module';
import services from './services/services.module';
import utilities from './utilities/utilities.module';

// Configuration
import routing from './app.config';
import runBlock from './app.run';

// create main app module
export default angular.module('ldVOWLApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngCookies', components, filters,
  services, utilities])
  .config(routing)
  .run(runBlock);
