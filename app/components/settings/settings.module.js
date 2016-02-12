import angular from 'angular';

import SettingsCtrl from './settings.ctrl';
import blacklist from './blacklist/blacklist.module.js';

export default angular.module('components.settings', [blacklist])
  .controller('SettingsCtrl', SettingsCtrl)
  .name;
