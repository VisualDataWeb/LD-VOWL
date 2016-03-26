import app from '../../../app/app';

describe('Controller: StartCtrl', function () {
  'use strict';

  let $location;

  let StartCtrl;
  let Nodes;
  let Properties;
  let Requests;

  let defaultEndpointURL = 'http://dbpedia.org/sparql';
  let nonProxyEndpoints = 30;
  let proxyOnlyEndpoints = 30;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function ($controller, _$location_, _Nodes_, _Properties_, _Requests_) {
    StartCtrl = $controller('StartCtrl', {});
    $location = _$location_;
    Nodes = _Nodes_;
    Properties = _Properties_;
    Requests = _Requests_;
  }));

  it('should have an array for non-proxy endpoints', function() {
    expect(StartCtrl.nonProxyEndpoints).toBeDefined();
  });

  it('should have more then 30 non-proxy endpoints', function () {
    expect(StartCtrl.nonProxyEndpoints.length).toBeGreaterThan(nonProxyEndpoints);
  });

  it('should have an array for proxy only endpoints', function () {
    expect(StartCtrl.proxyOnlyEndpoints).toBeDefined();
  });

  it('should have more then 30 proxy only endpoints', function () {
    expect(StartCtrl.proxyOnlyEndpoints.length).toBeGreaterThan(proxyOnlyEndpoints);
  });

  it('should have a flag for proxy availability', function () {
    expect(StartCtrl.proxyAvailable).toBeTruthy();
  });

  it('should be on the DBpedia endpoint', function () {
    expect(StartCtrl.endpoint).toBe(defaultEndpointURL);
  });

  it('should not use a proxy', function() {
    expect(StartCtrl.useLocalProxy).toBeFalsy();
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
      spyOn(Nodes, 'clearAll').and.callThrough();
      spyOn(Properties, 'clearAll').and.callThrough();
      spyOn(Requests, 'clear').and.callThrough();
      spyOn($location, 'path').and.callThrough();
      StartCtrl.showGraph();
      expect(Nodes.clearAll).not.toHaveBeenCalled();
      expect(Properties.clearAll).not.toHaveBeenCalled();
      expect(Requests.clear).not.toHaveBeenCalled();
      expect($location.path).toHaveBeenCalledWith('graph');
    });

    it('should clear data if endpoint has changed', function () {
      StartCtrl.endpoint = 'http://transparency.270a.info/sparql';
      spyOn(Nodes, 'clearAll').and.callThrough();
      spyOn(Properties, 'clearAll').and.callThrough();
      spyOn(Requests, 'clear').and.callThrough();
      spyOn($location, 'path').and.callThrough();
      StartCtrl.showGraph();
      expect(Nodes.clearAll).toHaveBeenCalled();
      expect(Properties.clearAll).toHaveBeenCalled();
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
