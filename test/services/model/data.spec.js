import app from '../../../app/app';
import angular from 'angular';

describe('Service Data', function () {

  let data;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (Data) {
    data = Data;
  }));

  it('should have a function to clear all data', function() {
    expect(data.clearAll).toBeDefined();
  });

  it('should have a function to initialize maps', function () {
    expect(data.initMaps).toBeDefined();
  });

});
