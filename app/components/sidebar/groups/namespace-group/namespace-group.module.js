import angular from 'angular';

import NamespaceGroupCtrl from './namespace-group.ctrl';
import NamespaceGroup from './namespace-group.drv';

/**
 * @ngdoc module
 * @name components.sidebar.groups.namespace
 *
 * @description
 *
 * This module represents the namespace group in the sidebar accordion.
 */
const namespaceGroupModule = angular.module('components.sidebar.groups.namespace', [])
                                    .controller('NamespaceGroupCtrl', NamespaceGroupCtrl)
                                    .directive('namespaceGroup', NamespaceGroup);

export default namespaceGroupModule;
