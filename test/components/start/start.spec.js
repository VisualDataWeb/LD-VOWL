import app from '../../../app/app';
import angular from 'angular';

describe('Controller: StartCtrl', function () {

  let $scope;
  let $q;
  let $location;
  let $log;

  let StartCtrl;
  let Data;
  let View;
  let Requests;
  let RequestConfig;
  let Endpoints;

  let deferredNonProxyEndpoints;
  let deferredProxyEndpoints;

  let defaultEndpointURL = '';
  let nonProxyEndpoints = 30;
  let proxyOnlyEndpoints = 30;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function ($controller, _$q_, _$rootScope_, _$log_, _$location_, _Data_, _View_,
                                           _Requests_, _RequestConfig_, _Endpoints_) {

    $scope = _$rootScope_.$new();
    $log = _$log_;
    $location = _$location_;
    Data = _Data_;
    View = _View_;
    Requests = _Requests_;
    RequestConfig = _RequestConfig_;
    Endpoints = _Endpoints_;
    $q = _$q_;

    spyOn(Endpoints, 'getNonProxyEndpoints').and.callFake(() => {
      deferredNonProxyEndpoints = $q.defer();
      return deferredNonProxyEndpoints.promise;
    });

    spyOn(Endpoints, 'getProxyEndpoints').and.callFake(() => {
      deferredProxyEndpoints = $q.defer();
      return deferredProxyEndpoints.promise;
    });

    StartCtrl = $controller('StartCtrl', {
      '$log': $log,
      '$location': $location,
      'Data': Data,
      'View': View,
      'RequestConfig': RequestConfig,
      'Endpoints': Endpoints
    });
  }));

  beforeEach(() => {
    spyOn(StartCtrl, 'loadEndpoints').and.callThrough();
  });

  it('should be defined', () => {
    expect(StartCtrl).toBeDefined();
  });

  it('should be possible to retrieve non-proxy endpoints', () => {
    expect(StartCtrl.endpoints.length).toEqual(0);

    const fakeEndpoints = {
      data: [
        {
          name: 'dbpedia',
          url: 'http://dbpedia.org/sparql'
        }, {
          name: 'Nobelprize.org',
          url: 'http://data.nobelprize.org/sparql'
        }
      ]
    };

    deferredNonProxyEndpoints.resolve(fakeEndpoints);
    deferredProxyEndpoints.resolve(fakeEndpoints);

    $scope.$apply();

    expect(Endpoints.getNonProxyEndpoints).toHaveBeenCalled();
    expect(Endpoints.getProxyEndpoints).toHaveBeenCalled();

    expect(StartCtrl.endpoints.length).toEqual(4);
  });

  // TODO move this into a test case for endpoint service
  xit('should have more then 30 non-proxy endpoints', function () {
    expect(StartCtrl.nonProxyEndpoints.length).toBeGreaterThan(nonProxyEndpoints);
  });

  // TODO move this into a test case for endpoint service
  xit('should have an array for proxy only endpoints', function () {
    expect(StartCtrl.proxyOnlyEndpoints).toBeDefined();
  });

  // TODO move this into a test case for endpoint service
  xit('should have more then 30 proxy only endpoints', function () {
    expect(StartCtrl.proxyOnlyEndpoints.length).toBeGreaterThan(proxyOnlyEndpoints);
  });

  it('should not use a proxy', function() {
    expect(StartCtrl.useProxy).toBeFalsy();
  });

  it('should have an endpoint alert', function () {
    expect(StartCtrl.endpointAlert).toBeTruthy();
  });

  it('should be possible to close the endpoint alert', function () {
    expect(StartCtrl.endpointAlert).toBeTruthy();
    StartCtrl.closeEndpointAlert();
    expect(StartCtrl.endpointAlert).toBeFalsy();
  });

  describe('showGraph()', function () {

    it('should have a method to show the graph', function () {
      expect(StartCtrl.showGraph).toBeDefined();
    });

    it('should not clear data if endpoint is still the same', function () {
      StartCtrl.endpoint = defaultEndpointURL;
      spyOn(Data, 'clearAll').and.callThrough();
      spyOn(Requests, 'clear').and.callThrough();
      spyOn($location, 'path').and.callThrough();
      StartCtrl.showGraph();
      expect(Data.clearAll).not.toHaveBeenCalled();
      expect(Requests.clear).not.toHaveBeenCalled();
    });

    it('should clear data if endpoint has changed', function () {
      StartCtrl.endpoint = 'http://transparency.270a.info/sparql';
      spyOn(Data, 'clearAll').and.callThrough();
      spyOn(Requests, 'clear').and.callThrough();
      spyOn($location, 'path').and.callThrough();
      StartCtrl.showGraph();
      expect(Data.clearAll).toHaveBeenCalled();
      expect(Requests.clear).toHaveBeenCalled();
      expect($location.path).toHaveBeenCalledWith('graph');
    });

    it('should not change view if endpoint is empty', function () {
      StartCtrl.endpoint = '';
      spyOn($location, 'path').and.callThrough();
      StartCtrl.showGraph();
      expect($location.path).not.toHaveBeenCalled();
    });

    it('should not change view if endpoint is undefined', function () {
      StartCtrl.endpoint = undefined;
      spyOn($location, 'path').and.callThrough();
      StartCtrl.showGraph();
      expect($location.path).not.toHaveBeenCalled();
    });

  });

});
