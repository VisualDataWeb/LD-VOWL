/* globals browser, element, by */
'use strict';

describe('Start Page', function () {
  
  let appName = 'LinkedDataVOWL';
  let separator = ' — ';
  
  beforeEach(function () {
    browser.get('http://localhost:8080/#/');
  });

  it('should have a title', function () {
    expect(browser.getTitle()).toBe(appName + separator + 'Start');
  });
  
  it('should be possible to switch to settings page', function () {
    element(by.id('toSettings')).click();
    expect(browser.getTitle()).toBe(appName + separator + 'Settings');
  });

});
