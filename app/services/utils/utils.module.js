import angular from 'angular';

// utility services
import graphUtils from './graph-utils.srv';
import geometry from './geometry.srv';
import stopWatch from './stop-watch';

export default angular.module('services.utils', [])
                      .service('GraphUtils', graphUtils)
                      .service('Geometry', geometry)
                      .service('StopWatch', stopWatch);
