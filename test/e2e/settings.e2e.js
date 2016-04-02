/* globals browser, element, by */
'use strict';

describe('Settings Page', function () {
  
  let host = 'http://localhost';
  let portNumber = 8080;
  let pageName = 'settings';
  let appName = 'LinkedDataVOWL';
  let separator = ' — ';

  beforeEach(function () {
    browser.get(host + ':' + portNumber + '/#/' + pageName);
  });

  it('should be on the settings page', function () {
    expect(browser.getTitle()).toBe(appName + separator + 'Settings');
  });
  
  it('should be possible to go back to start page', function () {
    element(by.id('toStart')).click();
    expect(browser.getTitle()).toBe(appName + separator + 'Start');
  });

});