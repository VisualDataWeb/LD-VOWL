import angular from 'angular';
import GraphCtrl from './graph.ctrl';
import nodeLinkGraph from './nodelink-graph.drv';

/**
 * @ngdoc module
 * @name components.graph
 *
 * @description
 *
 * This module includes the graph view and the directive for the node link graph.
 */
export default angular.module('components.graph', [])
  .controller('GraphCtrl', GraphCtrl)
  .directive('nodeLinkGraph', nodeLinkGraph);
