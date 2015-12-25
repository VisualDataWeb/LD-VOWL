// var d3Module = angular.module('d3Module', []);
// var d3Service = require('./services/graph/d3.srv');
// var d3 = d3Module.factory('d3Service', ['$document', '$q', '$rootScope', '$window', d3Service]);

require('./utilities/q-all-settled');

var app = angular.module('ldVOWLApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngCookies', 'qAllSettled']);
//var app = angular.module('ldVOWLApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'd3Module']);

var nodeLinkGraph = require('./directives/nodelink-graph.drv');
var Slider = require('./directives/slider.drv');

// Controllers
var GraphCtrl = require('./controllers/graph.ctrl');
var HeaderCtrl = require('./controllers/header.ctrl');
var StartCtrl = require('./controllers/start.ctrl');
var SettingsCtrl = require('./controllers/settings.ctrl');

// Services
var RequestConfig = require('./services/requests/request-config.srv');
var QueryFactory = require('./services/requests/query-factory.srv');
var RequestCounter = require('./services/requests/request-counter.srv');

var ClassExtractor = require('./services/extractors/class-extractor.srv');
var RelationExtractor = require('./services/extractors/relation-extractor.srv');
var TypeExtractor = require('./services/extractors/type-extractor.srv');
var DetailExtractor = require('./services/extractors/detail-extractor.srv');

var Nodes = require('./services/model/nodes.srv');
var Requests = require('./services/model/requests.srv');
var Types = require('./services/model/types.srv');
var Properties = require('./services/model/properties.srv');
var Utils = require('./services/utils.srv');
var Filters = require('./services/model/extraction-filters.srv');

// TODO move constants somewhere else
app.constant('PREFIX', {
  'RDF': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'RDFS': 'http://www.w3.org/2000/01/rdf-schema#',
  'OWL': 'http://www.w3.org/2002/07/owl#'
});
app.constant('PROPERTY_BLACKLIST', {
  'RDF': ['type', 'first', 'rest', 'value', 'subject', 'predicate', 'object'],
  'RDFS': ['subClassOf', 'subPropertyOf', 'domain', 'range', 'label', 'comment', 'member', 'seeAlso', 'isDefinedBy'],
  'OWL': ['allValuesFrom', 'backwardCompatibleWith', 'cardinality', 'complementOf', 'differentFrom', 'disjointWith',
    'distinctMembers', 'equivalentClass', 'equivalentProperty', 'hasValue', 'imports', 'incompatibleWith',
    'intersectionOf', 'inverseOf', 'maxCardinality', 'minCardinality', 'oneOf', 'onProperty', 'priorVersion', 'sameAs',
    'someValuesFrom', 'unionOf', 'versionInfo']
});
app.constant('CLASS_BLACKLIST', {
  'RDF': ['List', 'langString', 'HTML', 'XMLLiteral', 'Property', 'Bag', 'Seq', 'Alt'],
  'RDFS': ['Resource', 'Literal', 'Class', 'Datatype', 'Statement', 'Container', 'ContainerMembershipProperty'],
  'OWL': ['AllDifferent', 'AnnotationProperty', 'Class', 'DataRange', 'DatatypeProperty', 'DeprecatedClass',
    'DeprecatedProperty', 'FunctionalProperty', 'InverseFunctionalProperty', 'Nothing', 'ObjectProperty', 'Ontology',
    'OntologyProperty', 'Restriction', 'SymmetricProperty', 'Thing', 'TransiticeProperty']
});

// HTTP Interceptor

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('RequestCounter');
}]);

app.config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        title: 'Start',
        templateUrl: 'views/start.html',
        controller: 'StartCtrl',
        controllerAs: 'start'
      })
      .when('/settings', {
        title: 'Settings',
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl',
        controllerAs: 'vm'
      })
      .when('/graph', {
        title: 'Graph',
        templateUrl: 'views/graph.html',
        controller: 'GraphCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]);

app.run(['$rootScope', function ($rootScope) {
  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    $rootScope.title = current.$$route.title;
  });
}]);

// FILTER

app.filter('uriLabel', function () {
  return function (uri) {
    var uriLabel = '';
    if (uri !== undefined && uri !== '') {
      var lastSlash = uri.lastIndexOf('/');
      var lastHash = uri.lastIndexOf('#');
      uriLabel = uri.substr(Math.max(lastSlash, lastHash) + 1).replace(/\_/g, ' ');
    }
    return uriLabel;
  };
});

app.filter('responseTime', function () {
  return function (time) {
    var timeStr = '';
    if (typeof time === 'number') {
      if (time > 1000) {
        timeStr = (time / 1000) + ' s';
      } else {
        timeStr = time + ' ms';
      }
    }
    return timeStr;
  };
});

app.directive('nodeLinkGraph', ['$window', '$log', 'Properties', 'Nodes', 'Utils', nodeLinkGraph]);
app.directive('slider', Slider);

app.service('RequestConfig', ['$cookies', RequestConfig]);
app.factory('QueryFactory', QueryFactory);
app.factory('RequestCounter', ['$q', 'Requests', RequestCounter]);

app.service('Nodes', ['$log', Nodes]);
app.service('Properties', ['$interval', '$log', Properties]);
app.service('Types', Types);
app.service('Requests', ['$rootScope', Requests]);
app.factory('Utils', Utils);
app.service('Filters', ['$cookies', Filters]);

app.service('ClassExtractor', ['$http', '$q', '$log', 'PREFIX', 'CLASS_BLACKLIST', 'RequestConfig',
  'QueryFactory', 'Nodes', ClassExtractor]);
app.service('RelationExtractor', ['$http', '$q', '$log', 'PREFIX', 'PROPERTY_BLACKLIST', 'QueryFactory',
  'RequestConfig', 'Nodes', 'Properties', RelationExtractor]);
app.service('TypeExtractor', ['$http', '$log', 'RequestConfig', 'QueryFactory', 'Nodes', 'Properties',
  'RelationExtractor', TypeExtractor]);
app.service('DetailExtractor', ['$http', '$log', 'QueryFactory', 'RequestConfig', 'Nodes', DetailExtractor]);

app.controller('GraphCtrl', ['$scope', '$q', '$log', 'Filters',  'ClassExtractor', 'RelationExtractor',
  'TypeExtractor', 'DetailExtractor', 'RequestConfig', 'Requests', GraphCtrl]);
app.controller('HeaderCtrl', ['$scope', '$location', HeaderCtrl]);
app.controller('StartCtrl', ['$log','$location', 'Nodes', 'Properties', 'Requests', 'RequestConfig', StartCtrl]);
app.controller('SettingsCtrl', ['PREFIX', 'PROPERTY_BLACKLIST', 'CLASS_BLACKLIST',
  'RequestConfig', 'Nodes', 'Properties', 'Requests', 'ClassExtractor', 'RelationExtractor', SettingsCtrl]);

module.exports = app;
