import angular from 'angular';

import httpLess from './http-less';
import uriLabel from './uri-label';

export default angular.module('filters', [])
  .filter('httpLess', httpLess)
  .filter('uriLabel', uriLabel)
  .name;
