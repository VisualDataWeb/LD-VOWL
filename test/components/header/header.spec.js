import app from '../../../app/app';

describe('Controller: HeaderCtrl', function () {

  "use strict";

  let HeaderCtrl;
  let $location;
  let $rootScope;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function ($controller, _$rootScope_, _$location_) {
    let scope = _$rootScope_.$new();
    $location = _$location_;
    HeaderCtrl = $controller('HeaderCtrl', {$scope: scope, $location: $location});
    $rootScope = _$rootScope_;
  }));

  it('should exist', function () {
    expect(HeaderCtrl).toBeDefined();
  });

  it('should have a method checking whether tab is active', function () {
    expect(HeaderCtrl.isActive).toBeDefined();
  });

  it('should be on start', function () {
    expect(HeaderCtrl.isActive('')).toBeTruthy();
  });

  it('should switch to loading', function () {
    expect(HeaderCtrl.loading).toBeFalsy();
    $rootScope.$broadcast('pending-requests-changed', 1);
    expect(HeaderCtrl.loading).toBeTruthy();
    $rootScope.$broadcast('pending-requests-changed', 0);
    expect(HeaderCtrl.loading).toBeFalsy();
  });

});
