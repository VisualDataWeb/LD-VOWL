const files = {
  angular: 'angular',
  angularAnimate: 'angular-animate',
  angularRoute: 'angular-route',
  angularMocks: 'angular-mocks',
  angularCookies: 'angular-cookies',
  uiBootstrap: 'angular-ui-bootstrap'
};
 
window.Event = {};
 
const localStorageMock = (function() {
  var store = {};
  return {
    getItem: function(key) {
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
 
jest.dontMock(files.angular)
  .dontMock(files.angularAnimate)
  .dontMock(files.angularRoute)
  .dontMock(files.angularMocks)
  .dontMock(files.angularCookies);

require(files.angular);
require(files.angularAnimate);
require(files.angularRoute);
require(files.angularMocks);
require(files.angularCookies);
require(files.uiBootstrap);

require('../app/app.js');
