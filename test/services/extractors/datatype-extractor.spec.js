import app from '../../../app/app';
import angular from 'angular';

describe('Service: DataTypeExtractor', function () {
  'use strict';

  let dataTypeExtractor;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (DataTypeExtractor) {
    dataTypeExtractor = DataTypeExtractor;
  }));

  it('should have a method to request referring types', function () {
    expect(dataTypeExtractor.requestReferringTypes).toBeDefined();
  });

});
