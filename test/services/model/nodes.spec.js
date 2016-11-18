import * as angular from 'angular';
import app from '../../../app/app';

describe('Service: Nodes', function () {
  'use strict';

  let nodes;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (Nodes) {
    nodes = Nodes;
  }));

  it('should have a method to initialize maps', function () {
    expect(nodes.initMap).toBeDefined();
  });

  it('should have a method to build the prefix map', function () {
    expect(nodes.buildPrefixMap).toBeDefined();
  });

  it('should have a method to update the node storage', function () {
    expect(nodes.updateStorage).toBeDefined();
  });

  it('should have a method to add a new node', function () {
    expect(nodes.addNode).toBeDefined();
  });

  it('should have a method returning all nodes', function () {
    expect(nodes.getNodes).toBeDefined();
  });

  it('should have a method to get a node by its id', function () {
    expect(nodes.getById).toBeDefined();
  });

  it('should have a method returning the instance count of a node with a given id', function () {
    expect(nodes.getInstanceCountById).toBeDefined();
  });

  it('should have a method returning the URI by the given node id', function () {
    expect(nodes.getURIById).toBeDefined();
  });

  it('should have a method to insert a label', function () {
    expect(nodes.insertLabel).toBeDefined();
  });

  it('should have a method to insert a comment', function () {
    expect(nodes.insertComment).toBeDefined();
  });
  
  it('should have a method to set the URI for a node with a given id', function () {
    expect(nodes.setURI).toBeDefined();
  });
  
  it('should have a method to flag wether types were loaded', function () {
    expect(nodes.setTypesLoaded).toBeDefined();
  });
  
  it('should have a method to return types loaded flag of a node with a given id', function () {
    expect(nodes.getTypesLoaded).toBeDefined();
  });
  
  it('should have a method to merge classes', function () {
    expect(nodes.mergeClasses).toBeDefined();
  });
  
  it('should have a method to return node or its equivalent', function () {
    expect(nodes.getClassNodeOrEquivalent).toBeDefined();
  });
  
  it('should have a method to remove nodes', function () {
    expect(nodes.removeNodes).toBeDefined();
  });
  
  it('should have a method to increase the value of a node', function () {
    expect(nodes.incValueOfId).toBeDefined();
  });
  
  it('should have a methid returning whether nodes are empty', function () {
    expect(nodes.isEmpty).toBeDefined();
  });
  
  it('should be empty in the beginning', function () {
    expect(nodes.isEmpty()).toBeTruthy();
  });
  
  it('should have a method indicating whether there are class nodes', function () {
    expect(nodes.hasClassNodes).toBeDefined();
  });
  
  it('should have no class nodes at the beginning', function () {
    expect(nodes.hasClassNodes()).toBeFalsy();
  });
  
  it('should have a method to clear all data', function () {
    expect(nodes.clearAll).toBeDefined();
  });
  
  it('should have a method whether there is a sub class relation between 2 given nodes', function () {
    expect(nodes.hasSubClassPropNode).toBeDefined();
  });

});
