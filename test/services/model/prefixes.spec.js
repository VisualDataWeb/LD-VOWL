import app from '../../../app/app';

describe('Service: Prefixes', function () {
  "use strict";

  let prefixes;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (Prefixes) {
    prefixes = Prefixes;
  }));

  afterEach(function () {
    prefixes.clear();
  });

  it('should be defined', function () {
    expect(prefixes).toBeDefined();
  });

  it('should have a method to add a new prefix', function () {
    expect(prefixes.addPrefix).toBeDefined();
  });

  it('should not be possible to add a single string', function () {
    expect(prefixes.size()).toBe(0);
    prefixes.addPrefix('http://not-added.com');
    expect(prefixes.size()).toBe(0);
  });

  it('should be possible to add a proper prefix object', function () {
    expect(prefixes.size()).toBe(0);
    let newPrefix = {
      prefix: 'http://new-prefix.net'
    };
    prefixes.addPrefix(newPrefix);
    expect(prefixes.size()).toBe(1);
  });

  it('should have a method to remove all prefixes', function () {
    expect(prefixes.clear).toBeDefined();
  });

  it('should have a method to return all prefixes', function () {
    expect(prefixes.getPrefixes).toBeDefined();
  });

  it('should return an empty array in the beginning', function () {
    let content = prefixes.getPrefixes();
    expect(content).toBeDefined();
    expect(content.length).toBe(0);
  });
  
  it('should a method to replace all prefixes', function () {
    expect(prefixes.setPrefixes).toBeDefined();
  });
  
  it('should have a method returning the color number for an URI', function () {
    expect(prefixes.getColor).toBeDefined();
  });
  
  it('should return color 1 if different colors is unchecked', function () {
    prefixes.toggleDifferentColors();
    expect(prefixes.getColor('http://foo.bar')).toBe(1);
    prefixes.toggleDifferentColors();
  });
  
  it('should have a method returning whether something is internal', function () {
    expect(prefixes.isInternal).toBeDefined();
  });
  
  it('should have a method to return different color flag', function () {
    expect(prefixes.getDifferentColors).toBeDefined();
  });
  
  it('should use different colors', function () {
    expect(prefixes.getDifferentColors).toBeTruthy();
  });
  
  it('should have a method to toggle different colors', function () {
    expect(prefixes.toggleDifferentColors).toBeDefined();
  });
  
  it('should allow to toggle te different color flag', function () {
    expect(prefixes.getDifferentColors()).toBeTruthy();
    prefixes.toggleDifferentColors();
    expect(prefixes.getDifferentColors()).toBeFalsy();
    prefixes.toggleDifferentColors();
    expect(prefixes.getDifferentColors()).toBeTruthy();
  });

  it('should have a method returning the size', function () {
    expect(prefixes.size).toBeDefined();
  });
  
  it('should be empty in the beginning', function () {
    expect(prefixes.size()).toBe(0);
  });
  
});
