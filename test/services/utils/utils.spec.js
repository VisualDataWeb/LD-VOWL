import angular from 'angular';
import app from '../../../app/app';

describe('Service: Utils', function () {

  let graphUtilsService;

  let uriWithHash = 'http://www.w3.org/2004/02/skos/core#Concept';
  let uriWithoutHash = 'http://dbpedia.org/ontology/Country';

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function(GraphUtils) {
    graphUtilsService = GraphUtils;
  }));

  it('should exist', function () {
    expect(graphUtilsService).toBeDefined();
  });

  it('should extract a label from an URI with a hash', function() {
    expect(graphUtilsService.labelFromURI(uriWithHash)).toBe('Concept');
  });

  it('should extract a label from an URI without a hash', function() {
    expect(graphUtilsService.labelFromURI(uriWithoutHash)).toBe('Country');
  });

});
