import angular from 'angular';

import EndpointGroup from './endpoint-group.drv';
import EndpointGroupCtrl from './endpoint-group.ctrl';

export default angular.module('sidebar.groups.endpoint', [])
                      .controller('EndpointGroupCtrl', EndpointGroupCtrl)
                      .directive('endpointGroup', EndpointGroup)
                      .name;
