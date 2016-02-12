import angular from 'angular';

import HeaderCtrl from './header.ctrl';

export default angular.module('components.header', [])
              .controller('HeaderCtrl', HeaderCtrl)
              .name;
