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

var Prefixes = require('./services/model/prefixes.srv');
var Nodes = require('./services/model/nodes.srv');
var Requests = require('./services/model/requests.srv');
var Types = require('./services/model/types.srv'); // TODO unused?
var Properties = require('./services/model/properties.srv');
var Utils = require('./services/utils.srv');
var Filters = require('./services/model/extraction-filters.srv');

// accordion group directives
var EndpointGroup = require('./directives/accordion-groups/endpoint-group.drv');
var NamespaceGroup = require('./directives/accordion-groups/namespace-group.drv');
var GraphSettingsGroup = require('./directives/accordion-groups/graph-settings-group.drv');
var FilterGroup = require('./directives/accordion-groups/filter-group.drv');
var SelectionGroup = require('./directives/accordion-groups/selection-group.drv');

// selection directives
var NoSelection = require('./directives/accordion-groups/selection/no-selection.drv');
var ClassSelection = require('./directives/accordion-groups/selection/class-selection.drv');
var TypeSelection = require('./directives/accordion-groups/selection/type-selection.drv');
var PropertySelection = require('./directives/accordion-groups/selection/prop-selection.drv');
var DatatypePropertySelection = require('./directives/accordion-groups/selection/datatype-prop-selection.drv');
var SubclassPropertySelection = require('./directives/accordion-groups/selection/subclass-prop-selection.drv');

// filters
var HttpLessFilter = require('./filters/http-less');
var UriLabelFilter = require('./filters/uri-label');

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
    'OntologyProperty', 'Restriction', 'SymmetricProperty', 'Thing', 'TransitiveProperty']
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

app.filter('uriLabel', UriLabelFilter);

app.filter('httpLess', HttpLessFilter);

//TODO remove me
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

// register directives

app.directive('nodeLinkGraph', ['$window', '$log', 'Properties', 'Nodes', 'Prefixes', 'Filters', 'Utils',
              nodeLinkGraph]);
app.directive('slider', Slider);

app.directive('endpointGroup', EndpointGroup);
app.directive('namespaceGroup', NamespaceGroup);
app.directive('graphSettingsGroup', GraphSettingsGroup);
app.directive('filterGroup', FilterGroup);
app.directive('selectionGroup', SelectionGroup);

app.directive('noSelection', NoSelection);
app.directive('classSelection', ClassSelection);
app.directive('typeSelection', TypeSelection);
app.directive('propSelection', PropertySelection);
app.directive('datatypePropSelection', DatatypePropertySelection);
app.directive('subclassPropSelection', SubclassPropertySelection);

// register services

app.service('RequestConfig', ['$cookies', RequestConfig]);
app.factory('QueryFactory', QueryFactory);
app.factory('RequestCounter', ['$q', 'Requests', RequestCounter]);

app.service('Prefixes', ['$rootScope', Prefixes]);
app.service('Nodes', ['$log', 'Properties', 'Prefixes', Nodes]);
app.service('Properties', ['$interval', '$log', Properties]);
app.service('Types', Types);
app.service('Requests', ['$rootScope', Requests]);
app.factory('Utils', Utils);
app.service('Filters', ['$cookies', '$log', Filters]);

app.service('ClassExtractor', ['$http', '$q', '$log', 'PREFIX', 'CLASS_BLACKLIST', 'RequestConfig',
  'QueryFactory', 'Nodes', ClassExtractor]);
app.service('RelationExtractor', ['$http', '$q', '$log', 'PREFIX', 'PROPERTY_BLACKLIST', 'QueryFactory',
  'RequestConfig', 'Nodes', 'Properties', RelationExtractor]);
app.service('TypeExtractor', ['$http', '$log', 'RequestConfig', 'QueryFactory', 'Nodes', 'Properties',
  'RelationExtractor', TypeExtractor]);
app.service('DetailExtractor', ['$http', '$log', 'QueryFactory', 'RequestConfig', 'Nodes', DetailExtractor]);

// register controllers

app.controller('GraphCtrl', ['$scope', '$q', '$log', 'Filters',  'ClassExtractor', 'RelationExtractor',
  'TypeExtractor', 'DetailExtractor', 'RequestConfig', 'Requests', 'Prefixes', GraphCtrl]);
app.controller('HeaderCtrl', ['$scope', '$location', HeaderCtrl]);
app.controller('StartCtrl', ['$log','$location', 'Nodes', 'Properties', 'Requests', 'RequestConfig', StartCtrl]);
app.controller('SettingsCtrl', ['PREFIX', 'PROPERTY_BLACKLIST', 'CLASS_BLACKLIST',
  'RequestConfig', 'Nodes', 'Properties', 'Requests', 'ClassExtractor', 'RelationExtractor', SettingsCtrl]);

module.exports = app;
