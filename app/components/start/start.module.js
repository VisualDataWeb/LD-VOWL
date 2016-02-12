import angular from 'angular';

import StartCtrl from './start.ctrl';

export default angular.module('components.start', [])
  .controller('StartCtrl', StartCtrl)
  .name;