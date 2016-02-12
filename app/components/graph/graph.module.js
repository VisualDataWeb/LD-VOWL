import angular from 'angular';

import GraphCtrl from './graph.ctrl';
import nodeLinkGraph from './nodelink-graph.drv';

export default angular.module('components.graph', [])
  .controller('GraphCtrl', GraphCtrl)
  .directive('nodeLinkGraph', nodeLinkGraph)
  .name;
