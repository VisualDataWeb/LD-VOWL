import angular from 'angular';

// utility services
import utils from './utils.srv.js';
import geometry from './geometry.srv.js';
import stopWatch from './stop-watch';

export default angular.module('services.utils', [])
                      .service('Utils', utils)
                      .service('Geometry', geometry)
                      .service('StopWatch', stopWatch);
