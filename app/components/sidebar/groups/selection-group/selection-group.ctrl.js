function selectionGroupCtrl() {

  'ngInject';

  const vm = this;

  vm.selected = {
    uri: 'none',
    name: '',
    type: '',
    value: 0,
    props: []
  };

  vm.numberOfProps = 5;

  vm.incNumberOfProps = function() {
    vm.numberOfProps *= 2;
  };

}

export default selectionGroupCtrl;
