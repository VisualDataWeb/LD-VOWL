import 'angular';
import '../node_modules/angular-mocks/angular-mocks';
import '../node_modules/angular-route/';
import '../node_modules/angular-animate/';
import '../node_modules/angular-cookies/';
import '../node_modules/angular-ui-bootstrap/';

var testsContext = require.context(".", true, /.spec$/);
testsContext.keys().forEach(testsContext);
