import endpointGroupTemplate from './endpoint-group.html';

export default function endpointGroup() {

  return {
    restrict: 'E',
    scope: {},
    bindToController: {
      restart: '&',
      stop: '&'
    },
    controller: 'EndpointGroupCtrl',
    controllerAs: 'vm',
    template: endpointGroupTemplate
  };

}
