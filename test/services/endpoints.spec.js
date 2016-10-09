import app from  '../../app/app';

describe('Endpoints', () => {

  let endpoints;

  let $httpBackend;

  const NONPROXY_FILENAME = 'nonproxy_endpoints.json';
  const PROXY_FILENAME = 'proxy_endpoints.json';

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function ($injector, Endpoints) {
    $httpBackend = $injector.get('$httpBackend');

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

    $httpBackend.whenGET(NONPROXY_FILENAME).respond(fakeEndpoints);
    $httpBackend.whenGET(PROXY_FILENAME).respond(fakeEndpoints);

    endpoints = Endpoints;
  }));

  it('should be defined', () => {
    expect(endpoints).toBeDefined();
  });

  it('should have a function to get non-proxy endpoints', () => {
    expect(endpoints.getNonProxyEndpoints).toBeDefined();
    expect(NONPROXY_FILENAME.length).toBeGreaterThan(0);
    $httpBackend.expectGET(NONPROXY_FILENAME);

    endpoints.getNonProxyEndpoints();
    $httpBackend.flush();
  });

  it('should have a function to get proxy-only endpoints', () => {
    expect(endpoints.getProxyEndpoints).toBeDefined();
    expect(PROXY_FILENAME.length).toBeGreaterThan(0);
    $httpBackend.expectGET(PROXY_FILENAME);

    endpoints.getProxyEndpoints();
    $httpBackend.flush();
  });

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
