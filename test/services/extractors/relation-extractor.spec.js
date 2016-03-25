import app from '../../../app/app';

describe('Service: RelationExtractor', function () {
  "use strict";

  let relationExtractor;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (RelationExtractor) {
    relationExtractor = RelationExtractor;
  }));

  it('should exist', function () {
    expect(relationExtractor).toBeDefined();
  });

  it('should have a method to request class-to-class relation', function () {
    expect(relationExtractor.requestClassClassRelation).toBeDefined();
  });

  it('should have a method to request the label of a property', function () {
    expect(relationExtractor.requestPropertyLabel).toBeDefined();
  });

  it('should have a method to request class-to-type relations', function () {
    expect(relationExtractor.requestClassTypeRelation).toBeDefined();
  });

  it('should have a method to request class equality', function () {
    expect(relationExtractor.requestClassEquality).toBeDefined();
  });

});