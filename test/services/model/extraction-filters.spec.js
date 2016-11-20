import angular from 'angular';
import app from '../../../app/app';

describe('Service: Filters', function () {
  'use strict';

  let filters;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (Filters) {
    filters = Filters;
  }));

  it('should exist', function () {
    expect(filters).toBeDefined();
  });

  it('should have an initialization method', function () {
    expect(filters.init).toBeDefined();
  });

  it('should have a method returning the loop flag', function () {
    expect(filters.getIncludeLoops).toBeDefined();
  });

  it('should include property loops', function () {
    expect(filters.getIncludeLoops()).toBeTruthy();
  });

  it('should have a method to toggle property loops', function () {
    expect(filters.toggleLoops).toBeDefined();
  });

  it('should be possible to toggle property loops', function () {
    expect(filters.getIncludeLoops()).toBeTruthy();
    filters.toggleLoops();
    expect(filters.getIncludeLoops()).toBeFalsy();
    filters.toggleLoops();
    expect(filters.getIncludeLoops()).toBeTruthy();
  });

  it('should have a method returning the datatypes flag', function () {
    expect(filters.getIncludeLiterals).toBeDefined();
  });

  it('should include datatypes', function () {
    expect(filters.getIncludeLiterals()).toBeTruthy();
  });

  it('should have a method to toggle datatypes', function () {
    expect(filters.toggleLiterals()).toBeDefined();
  });

  it('should be possible to toggle datatypes', function () {
    expect(filters.getIncludeLoops()).toBeTruthy();
    filters.toggleLiterals();
    expect(filters.getIncludeLiterals()).toBeFalsy();
    filters.toggleLiterals();
    expect(filters.getIncludeLiterals()).toBeTruthy();
  });

  it('should have a method returning the disjoint node flag', function () {
    expect(filters.getIncludeDisjointNode).toBeDefined();
  });

  it('should not include disjoint nodes', function () {
    expect(filters.getIncludeDisjointNode()).toBeFalsy();
  });

  it('should have a method to toggle disjoint node', function () {
    expect(filters.toggleDisjointNode).toBeDefined();
  });

  it('should be possible to toggle disjoint node', function () {
    expect(filters.getIncludeDisjointNode()).toBeFalsy();
    filters.toggleDisjointNode();
    expect(filters.getIncludeDisjointNode()).toBeTruthy();
    filters.toggleDisjointNode();
    expect(filters.getIncludeDisjointNode()).toBeFalsy();
  });

  it('should have a method returning the sub class relation flag', function () {
    expect(filters.getIncludeSubclassRelations).toBeDefined();
  });

  it('should include sub class relations', function () {
    expect(filters.getIncludeSubclassRelations).toBeTruthy();
  });

  it('should have a method to toggle sub class relations', function () {
    expect(filters.toggleSubclassRelations).toBeDefined();
  });

  it('should be possible to toggle sub class relations', function () {
    expect(filters.getIncludeSubclassRelations()).toBeTruthy();
    filters.toggleSubclassRelations();
    expect(filters.getIncludeSubclassRelations()).toBeFalsy();
    filters.toggleSubclassRelations();
    expect(filters.getIncludeSubclassRelations()).toBeTruthy();
  });

});
