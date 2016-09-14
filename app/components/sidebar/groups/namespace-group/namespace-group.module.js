import angular from 'angular';

import NamespaceGroupCtrl from './namespace-group.ctrl';
import NamespaceGroup from './namespace-group.drv';

export default angular.module('sidebar.groups.namespace', [])
                      .controller('NamespaceGroupCtrl', NamespaceGroupCtrl)
                      .directive('namespaceGroup', NamespaceGroup)
                      .name;
