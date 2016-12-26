/**
 * @ngdoc service
 * @name Endpoints
 *
 * @param {$http} $http
 *
 * @ngInject
 */
function endpoints($http) {

  const NON_PROXY_ENDPOINTS_FILE_NAME = require('../nonproxy_endpoints.json');
  const PROXY_ENDPOINTS_FILE_NAME = require('../proxy_endpoints.json');

  const that = this;

  that.getNonProxyEndpoints = function () {
    let url;
    if (typeof NON_PROXY_ENDPOINTS_FILE_NAME !== 'string') {
      url = 'nonproxy_endpoints.json';
    } else {
      url = NON_PROXY_ENDPOINTS_FILE_NAME;
    }
    return $http.get(url);
  };

  that.getProxyEndpoints = function () {
    let url;
    if (typeof PROXY_ENDPOINTS_FILE_NAME !== 'string') {
      url = 'proxy_endpoints.json';
    } else {
      url = PROXY_ENDPOINTS_FILE_NAME;
    }
    return $http.get(url);
  };

}

export default endpoints;
