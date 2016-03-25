import app from '../../app/app';

describe('Filters: httpLess', function () {
  "use strict";

  let $filter;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function (_$filter_) {
    $filter = _$filter_;
  }));

  it('should remove the http part', function () {
    const testURL = 'http://www.foo.bar/test/entry#item';
    const result = $filter('httpLess')(testURL);
    expect(result).toBe('www.foo.bar/test/entry#item');
  });

});
