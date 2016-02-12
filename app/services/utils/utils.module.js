import angular from 'angular';

// utility services
import utils from './utils.srv.js';
import geometry from './geometry.srv.js';

export default angular.module('services.utils', [])
                      .service('Utils', utils)
                      .service('Geometry', geometry)
                      .name;