import angular from 'angular';

import BlacklistPrefixes from './blacklist_prefixes';
import BlacklistProperties from './blacklist_properties';
import BlacklistClasses from './blacklist_classes';

/**
 * @ngdoc module
 * @name blacklist
 * 
 * @description
 * 
 * This module includes the blacklists for classes and properties as constants.
 */
export default angular.module('blacklist', [])
  .constant('PREFIX', BlacklistPrefixes)
  .constant('PROPERTY_BLACKLIST', BlacklistProperties)
  .constant('CLASS_BLACKLIST', BlacklistClasses);
