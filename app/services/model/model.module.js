import angular from 'angular';

// import all model services
import Prefixes from './prefixes.srv';
import Nodes from './nodes.srv';
import Requests from './requests.srv';
import Properties from './properties.srv';
import Filters from './extraction-filters.srv';
import Data from './data.srv';
import View from './view.srv';

// create a new module, register the services and return the name
export default angular.module('services.model', [])
  .service('Prefixes', Prefixes)
  .service('Nodes', Nodes)
  .service('Requests', Requests)
  .service('Properties', Properties)
  .service('Filters', Filters)
  .service('Data', Data)
  .service('View', View);
