import angular from 'angular';

import AboutCtrl from './about.ctrl';

export default angular.module('components.about', [])
  .controller('AboutCtrl', AboutCtrl)
  .name;
