import angular from 'angular';

// import all services for requests
import RequestConfig from './request-config.srv';
import QueryFactory from './query-factory.srv';
import RequestCounter from './request-counter.srv';
import Promises from './promises.srv';

export default angular.module('services.requests', [])
  .service('RequestConfig', RequestConfig)
  .factory('QueryFactory', QueryFactory)
  .factory('RequestCounter', RequestCounter)
  .service('Promises', Promises);
