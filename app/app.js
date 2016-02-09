require('./utilities/q-all-settled');

var app = angular.module('ldVOWLApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'ngCookies', 'qAllSettled']);

var nodeLinkGraph = require('./components/graph/nodelink-graph.drv.js');
var Slider = require('./directives/slider.drv');

// Controllers
var GraphCtrl = require('./components/graph/graph.ctrl.js');
var HeaderCtrl = require('./components/header/header.ctrl.js');
var StartCtrl = require('./components/start/start.ctrl');
var SettingsCtrl = require('./components/settings/settings.ctrl.js');

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

var Geometry = require('./services/math/geometry.srv');

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

// register constants

app.constant('PREFIX', require('./constants/blacklist_prefixes'));
app.constant('PROPERTY_BLACKLIST', require('./constants/blacklist_properties'));
app.constant('CLASS_BLACKLIST', require('./constants/blacklist_classes'));

import routing from './app.config';
import runBlock from './app.run';

runBlock.$inject = ['$rootScope'];

app.config(routing);
app.run(runBlock);

// FILTER

app.filter('uriLabel', UriLabelFilter);
app.filter('httpLess', HttpLessFilter);

// register directives

app.directive('nodeLinkGraph', ['$window', '$log', 'Properties', 'Nodes', 'Prefixes', 'Filters', 'Geometry', 'Utils',
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

app.service('Prefixes', ['$rootScope', '$log', Prefixes]);
app.service('Nodes', ['$log', 'Properties', 'Prefixes', Nodes]);
app.service('Properties', ['$interval', '$log', Properties]);
app.service('Types', Types);
app.service('Requests', ['$rootScope', Requests]);
app.service('Utils', Utils);
app.service('Filters', ['$cookies', '$log', Filters]);

app.service('ClassExtractor', ['$http', '$q', '$log', 'PREFIX', 'CLASS_BLACKLIST', 'RequestConfig',
  'QueryFactory', 'Nodes', ClassExtractor]);
app.service('RelationExtractor', ['$http', '$q', '$log', 'PREFIX', 'PROPERTY_BLACKLIST', 'QueryFactory',
  'RequestConfig', 'Nodes', 'Properties', RelationExtractor]);
app.service('TypeExtractor', ['$http', '$log', 'RequestConfig', 'QueryFactory', 'Nodes', 'Properties',
  'RelationExtractor', TypeExtractor]);
app.service('DetailExtractor', ['$http', '$log', 'QueryFactory', 'RequestConfig', 'Nodes', DetailExtractor]);

app.service('Geometry', ['Utils', Geometry]);

// register controllers

app.controller('GraphCtrl', ['$scope', '$q', '$log', 'Filters',  'ClassExtractor', 'RelationExtractor',
  'TypeExtractor', 'DetailExtractor', 'RequestConfig', 'Requests', 'Prefixes', GraphCtrl]);
app.controller('HeaderCtrl', ['$scope', '$location', HeaderCtrl]);
app.controller('StartCtrl', ['$log','$location', 'Nodes', 'Properties', 'Requests', 'RequestConfig', StartCtrl]);
app.controller('SettingsCtrl', ['PREFIX', 'PROPERTY_BLACKLIST', 'CLASS_BLACKLIST',
  'RequestConfig', 'Nodes', 'Properties', 'Requests', 'ClassExtractor', 'RelationExtractor', SettingsCtrl]);

module.exports = app;
