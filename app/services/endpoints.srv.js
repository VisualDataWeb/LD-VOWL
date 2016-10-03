function endpoints($http) {

  'ngInject';

  const NON_PROXY_ENDPOINTS_FILE_NAME = 'nonproxy_endpoints.json';
  const PROXY_ENDPOINTS_FILE_NAME = 'proxy_endpoints.json';

  const that = this;

  that.getNonProxyEndpoints = function () {
    return $http.get(NON_PROXY_ENDPOINTS_FILE_NAME);
  };

  that.getProxyEndpoints = function () {
    return $http.get(PROXY_ENDPOINTS_FILE_NAME);
  };

}

export default endpoints;
