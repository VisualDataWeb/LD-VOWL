import app from '../../../app/app';

describe('Service: RequestConfig', function () {

  let rconf;

  let defaultEndpoint = 'http://dbpedia.org/sparql';
  let defaultLimit = 10;
  let defaultTimeout = 30000;
  let defaultLabelLang = 'en';

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (RequestConfig) {
    rconf = RequestConfig;
    rconf.setEndpointURL(defaultEndpoint);
    rconf.setLabelLanguage(defaultLabelLang);
  }));

  it('should exist', function () {
    expect(rconf).toBeDefined();
  });

  it('should return the current endpoint URL', function () {
    expect(rconf.getEndpointURL()).toBe(defaultEndpoint);
  });

  it('should be possible to set another endpoint url', function () {
    let newEndpointUrl = 'http://lod.springer.com/sparql';
    rconf.setEndpointURL(newEndpointUrl);
    expect(rconf.getEndpointURL()).toBe(newEndpointUrl);
  });

  it('should return the global limit', function () {
    expect(rconf.getLimit()).toBe(defaultLimit);
  });

  it('should be possible to set another legal limit', function () {
    let newLimit = 20;
    rconf.setLimit(newLimit);
    expect(rconf.getLimit()).toBe(newLimit);
    rconf.setLimit(defaultLimit);
    expect(rconf.getLimit()).toBe(defaultLimit);
  });

  it('should not be possible to set negative limit', function () {
    rconf.setLimit(-10);
    expect(rconf.getLimit()).toBe(defaultLimit);
  });

  it('should not be possible to set limit to string', function () {
    rconf.setLimit('illegal Limit');
    expect(rconf.getLimit()).toBe(defaultLimit);
  });

  it('should return the sparql timeout', function () {
    expect(rconf.getTimeout()).toBe(defaultTimeout);
  });

  it('should be possible to change the sparql timeout', function () {
    let newTimeout = 60000;
    rconf.setTimout(newTimeout);
    expect(rconf.getTimeout()).toBe(newTimeout);
  });

  it('should return label language', function () {
    expect(rconf.getLabelLanguage()).toBe(defaultLabelLang);
  });

  it('should be possible to set another label language', function () {
    let newLabelLang = 'de';
    rconf.setLabelLanguage(newLabelLang);
    expect(rconf.getLabelLanguage()).toBe(newLabelLang);
  });

  it('should return debug is on', function () {
    expect(rconf.getDebug()).toBe('on');
  });

  it('should return whether properties should be fetched ordered', function () {
    expect(rconf.getPropertiesOrdered()).toBeTruthy();
  });

  it('should be possible to disable ordered property retrieval', function () {
    rconf.setPropertiesOrdered(false);
    expect(rconf.getPropertiesOrdered()).toBeFalsy();
  });

});
