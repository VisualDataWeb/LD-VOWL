import angular from 'angular';

import HeaderCtrl from './header.ctrl';
import HeaderDirective from './header.drv';

export default angular.module('components.header', [])
              .controller('HeaderCtrl', HeaderCtrl)
              .directive('header', HeaderDirective)
              .name;
