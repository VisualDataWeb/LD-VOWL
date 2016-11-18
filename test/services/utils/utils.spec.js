import * as angular from 'angular';
import app from '../../../app/app';

describe('Service: Utils', function () {

  let utilsService;

  let uriWithHash = 'http://www.w3.org/2004/02/skos/core#Concept';
  let uriWithoutHash = 'http://dbpedia.org/ontology/Country';

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function(Utils) {
    utilsService = Utils;
  }));

  it('should exist', function () {
    expect(utilsService).toBeDefined();
  });

  it('should extract a label from an URI with a hash', function() {
    expect(utilsService.labelFromURI(uriWithHash)).toBe('Concept');
  });

  it('should extract a label from an URI without a hash', function() {
    expect(utilsService.labelFromURI(uriWithoutHash)).toBe('Country');
  });

});
