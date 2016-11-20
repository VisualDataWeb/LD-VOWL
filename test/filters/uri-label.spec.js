import angular from 'angular';
import app from '../../app/app';

describe('Filter: uriLabel', function () {
  'use strict';

  let $filter;
  let uriLabelFilter;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (_$filter_) {
    $filter = _$filter_;
    uriLabelFilter = $filter('uriLabel');
  }));

  it('should get part after last slash', function () {
    const slashTestURI = 'http://www.foo.bar/properties/works';
    expect(uriLabelFilter(slashTestURI)).toBe('works');
  });

  it('should get part after last hash', function () {
    const hashTestURI = 'http://www.foo.bar/entities/computers#marvin';
    expect(uriLabelFilter(hashTestURI)).toBe('marvin');
  });

  it('should replace underscores with spaces', function () {
    const underscoreToSpaceTest = 'http://foo.bar/all_these_underscores_should_be_replaced';
    expect(uriLabelFilter(underscoreToSpaceTest)).toBe('all these underscores should be replaced');
  });

});
