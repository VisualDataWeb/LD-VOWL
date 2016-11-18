import app from '../../../app/app';
import * as angular from 'angular';

describe('Service: ClassExtractor', function () {
  'use strict';

  let classExtractor;
  let httpBackend;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function ($httpBackend, ClassExtractor) {
    classExtractor = ClassExtractor;
    httpBackend = $httpBackend;
  }));

  it('should exist', function () {
    expect(classExtractor).toBeDefined();
  });

  it('should have a method to request classes', function () {
    expect(classExtractor.requestClasses).toBeDefined();
  });
  
  it('should have a method to request class labels', function () {
    expect(classExtractor.requestClassLabel).toBeDefined();
  });
  
  it('should have a method to request SKOS class label', function () {
    expect(classExtractor.requestClassSkosLabel).toBeDefined();
  });

});
