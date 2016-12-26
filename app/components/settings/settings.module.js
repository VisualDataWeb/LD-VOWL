import angular from 'angular';

import SettingsCtrl from './settings.ctrl';
import blacklist from './blacklist/blacklist.module.js';

/**
 * @ngdoc module
 * @name components.settings
 *
 * @requires blacklist
 *
 * @description
 *
 * This is the settings module of the application. This is where you can configure the extraction of the tbox
 * information and the blacklist being used.
 */
export default angular.module('components.settings', [blacklist.name])
  .controller('SettingsCtrl', SettingsCtrl);
