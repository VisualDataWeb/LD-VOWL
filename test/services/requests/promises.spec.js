import app from '../../../app/app';

describe('Service: Promises', function () {
  "use strict";

  let promises;
  let $q;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (_$q_, Promises) {
    promises = Promises;
    $q = _$q_;
  }));

  afterEach(function () {
    promises.rejectAll();
  });

  describe('getSize', function () {

    it('should have a method to get the number of promises', function () {
      expect(promises.getSize).toBeDefined();
    });

    it('should have no promises at the beginning', function () {
      expect(promises.getSize()).toBe(0);
    });

  });

  describe('addPromise()', function () {

    it('should have a method to add a promise', function () {
      expect(promises.addPromise).toBeDefined();
    });

    it('should be possible to add a promise', function () {
      expect(promises.getSize()).toBe(0);
      expect(promises.addPromise($q.defer())).toBe('promise0');
      expect(promises.getSize()).toBe(1);
    });

  });

  describe('removePromise()', function () {

    it('should be possible to delete a promise', function () {
      expect(promises.getSize()).toBe(0);
      let newPromise = $q.defer();
      let promiseId = promises.addPromise(newPromise);
      expect(promises.getSize()).toBe(1);

      newPromise.resolve({});
      promises.removePromise(promiseId);
      expect(promises.getSize()).toBe(0);
    });

  });

  describe('rejectAll()', function () {

    it('should have a method to reject all promises', function () {
      expect(promises.rejectAll).toBeDefined();
    });

    it('should resolve and clear all promises', function () {
      expect(promises.getSize()).toBe(0);
      let first = $q.defer();
      let second = $q.defer();

      spyOn(first, 'resolve').and.callThrough();
      spyOn(second,'resolve').and.callThrough();

      promises.addPromise(first);
      promises.addPromise(second);
      expect(promises.getSize()).toBe(2);
      promises.rejectAll();
      expect(promises.getSize()).toBe(0);

      expect(first.resolve).toHaveBeenCalled();
      expect(second.resolve).toHaveBeenCalled();
    });

  });

});
