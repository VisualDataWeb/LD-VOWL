import app from '../../../app/app';
import * as angular from 'angular';

describe('Service: TypeExtractor', function () {
  'use strict';

  let typeExtractor;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (TypeExtractor) {
    typeExtractor = TypeExtractor;
  }));

  it('should have a method to request referring types', function () {
    expect(typeExtractor.requestReferringTypes).toBeDefined();
  });

});
