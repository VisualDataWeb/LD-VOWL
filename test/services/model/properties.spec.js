import app from '../../../app/app';
import angular from 'angular';

describe('Service: Properties', function () {
  'use strict';
  
  let properties;

  const testSourceId = 'sourceNode1';
  const testIntermediateId = 'intermediateNode1';
  const testTargetId = 'targetNode1';
  const testURI = 'http://ldvowl.org/properties/testProperty';
  
  beforeEach(angular.mock.module(app.name));
  
  beforeEach(angular.mock.inject(function (Properties) {
    properties = Properties;
  }));

  afterEach(function () {
    properties.clearAll();
  });
  
  it('should exist', function () {
    expect(properties).toBeDefined();
  });

  it('should have an initialization method', function () {
    expect(properties.initProperties).toBeDefined();
  });

  it('should have a method starting the storage update', function () {
    expect(properties.startStorageUpdate).toBeDefined();
  });

  it('should have a method ending the storage update', function () {
    expect(properties.endStorageUpdate).toBeDefined();
  });

  it('should have a method updating the storage', function () {
    expect(properties.updateStorage).toBeDefined();
  });

  describe('existsBetween()', function () {

    it('should have a method returning whether a property exist between two nodes', function () {
      expect(properties.existsBetween).toBeDefined();
    });

    it('should be possible to check whether there is a relation between two nodes', function () {
      expect(properties.existsBetween(testSourceId, testTargetId)).toBeFalsy();
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.existsBetween(testSourceId, testTargetId)).toBeTruthy();
    });

    it('should deny property existence if source node is missing', function () {
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.existsBetween(undefined, testTargetId)).toBeFalsy();
    });

    it('should deny property existence if target node is missing', function() {
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.existsBetween(testSourceId, undefined)).toBeFalsy();
    });

  });

  describe('addProperty()', function () {

    it('should have a method to add a new property', function () {
      expect(properties.addProperty).toBeDefined();
    });

    it('should not be possible to add a property without a source', function () {
      expect(properties.properties.length).toBe(0);
      properties.addProperty(undefined, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.properties.length).toBe(0);
    });

    it('should not be possible to add a property without an intermediate', function () {
      expect(properties.properties.length).toBe(0);
      properties.addProperty(testSourceId, undefined, testTargetId, testURI, 1);
      expect(properties.properties.length).toBe(0);
    });

    it('should not be possible to add a property without a target', function () {
      expect(properties.properties.length).toBe(0);
      properties.addProperty(testSourceId, testIntermediateId, undefined, testURI, 1);
      expect(properties.properties.length).toBe(0);
    });

    it('should not be possible to add a property without an URI', function () {
      expect(properties.properties.length).toBe(0);
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, undefined, 1);
      expect(properties.properties.length).toBe(0);
    });

    it('should not be possible to add the same property more then one time', function () {
      expect(properties.properties.length).toBe(0);
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.properties.length).toBe(1);

      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.properties.length).toBe(1);
    });

  });

  describe('addSubClassProperty()', function () {

    it('should have a method to add a sub class property', function () {
      expect(properties.addSubClassProperty).toBeDefined();
    });

    it('should not be possible to add a sub class property without source', function () {
      expect(properties.properties.length).toBe(0);
      properties.addSubClassProperty(undefined, testIntermediateId, testTargetId);
      expect(properties.properties.length).toBe(0);
    });

    it('should not be possible to add a sub class property without intermediate node', function () {
      expect(properties.properties.length).toBe(0);
      properties.addSubClassProperty(testSourceId, undefined, testTargetId);
      expect(properties.properties.length).toBe(0);
    });

    it('should not be possible to add a sub class property without a target node', function() {
      expect(properties.properties.length).toBe(0);
      properties.addSubClassProperty(testSourceId, testIntermediateId, undefined);
      expect(properties.properties.length).toBe(0);
    });

  });

  describe('addDisjointProp()', function () {

    it('should have a method to add a disjoint property', function () {
      expect(properties.addDisjointProp).toBeDefined();
    });
    
  });

  describe('clearAll()', function () {

    it('should have a method to clearing all properties', function () {
      expect(properties.clearAll).toBeDefined();
    });

    it('should be possible to clear all properties', function () {
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.properties.length).toBeGreaterThan(0);
      properties.clearAll();
      expect(properties.properties.length).toBe(0);
    });

  });

  describe('getProperties()', function () {

    it('should have a method returning all properties', function () {
      expect(properties.getProperties).toBeDefined();
    });

    it('should return an empty array of properties in the beginning', function () {
      let propertyContent = properties.getProperties();
      expect(propertyContent.length).toBe(0);
    });

    it('should return added properties', function () {
      expect(properties.getProperties().length).toBe(0);
      properties.addProperty(testSourceId, testIntermediateId, testTargetId, testURI, 1);
      expect(properties.getProperties().length).toBe(1);
    });

  });

});
