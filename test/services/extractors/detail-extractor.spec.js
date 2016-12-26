import app from '../../../app/app';
import angular from 'angular';

describe('Service: DetailExtractor', function () {
  
  'use strict';

  let detailExtractor;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (DetailExtractor) {
    detailExtractor = DetailExtractor;
  }));

  it('should exist', function () {
    expect(detailExtractor).toBeDefined();
  });

  it('should have a method to fetch comment for class', function () {
    expect(detailExtractor.requestCommentForClass).toBeDefined();
  });

});
