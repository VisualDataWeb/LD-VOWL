import angular from 'angular';

import BlacklistPrefixes from './blacklist_prefixes';
import BlacklistProperties from './blacklist_properties';
import BlacklistClasses from './blacklist_classes';

export default angular.module('constants', [])
  .constant('PREFIX', BlacklistPrefixes)
  .constant('PROPERTY_BLACKLIST', BlacklistProperties)
  .constant('CLASS_BLACKLIST', BlacklistClasses)
  .name;
