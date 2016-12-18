import angular from 'angular';
import d3 from 'd3';

/**
 * @ngdoc directive
 * @name NodeLinkGraph
 * @module components.graph
 *
 * @param {$window} $window
 * @param {$log} $log
 * @param {Properties} Properties
 * @param {Nodes} Nodes
 * @param {Prefixes} Prefixes
 * @param {Filters} Filters
 * @param {GraphUtils} GraphUtils
 * @param {Requests} Requests
 * @param {View} View
 * @param {Links} Links
 *
 * @description
 *
 * This is the directive which shows the node link graph using D3.
 * 
 * @return {{restrict: string, scope: Object, link: function}}
 *
 * @ngInject
 */
function NodeLinkGraph($window, $log, Properties, Nodes, Prefixes, Filters, GraphUtils, Requests, View, Links) {

  return {
    restrict: 'EA',
    scope: {
      data: '=', // bidirectional data-binding
      onClick: '&' // parent execution
    },
    link: function (scope, element, attrs) {
      var margin = parseInt(attrs.margin) || 20;
      var width = 0;
      var height = parseInt(attrs.height) || $window.innerHeight;

      var colorRange = [d3.rgb('#3366CC'), d3.rgb('#EE2867')];

      var defaultRadius = 20;

      var defaultPropHeight = 20;
      var ringWidth = 4;
      var svg = d3.select(element[0])
                  .append('svg')
                  .style('width', '100%');

      var root = svg.append('g');

      let linkContainer = root.append('g')
                          .attr('class', 'linkContainer');

      let nodeContainer = root.append('g')
                                .attr('class', 'nodeContainer');

      let notification = svg.append('g')
                            .attr('id', 'notification');
      let notificationText = notification.append('text')
                              .attr('class', 'notification')
                              .style('opacity', 0.0);

      let lastUpdate = null;

      const minUpdateInterval = 1500;

      // Browser onresize event
      $window.onresize = function () {
        height = $window.innerHeight;
        svg.attr('height', Math.max(height - 60, 0));
        scope.drawPlaceholder(scope.data, width, height);
        scope.$apply();
      };

      scope.paused = false;

      scope.disjointNodeWidth = 40;
      scope.disjointNodeHeight = 20;

      scope.node = {};
      scope.force = {};
      scope.cardinalSpline = {};
      scope.loopSpline = {};
      scope.linearLine = {};

      scope.zoom = d3.behavior.zoom()
                    .scaleExtent([0.1, 2.0])
                    .duration(150);

      scope.translate = View.getTranslate();
      scope.scale = View.getScale();

      scope.color = d3.scale.linear()
                            .domain([1, Prefixes.size()])
                            .interpolate(d3.interpolateHsl)
                            .range(colorRange);

      scope.data = {
        'nodes': Nodes.getNodes(),
        'properties': Properties.getProperties(),
        'prefixes': Prefixes.getPrefixes(),
        'showTypes': Filters.getIncludeDataTypes(),
        'showLoops': Filters.getIncludeLoops(),
        'showDisjointNode': Filters.getIncludeDisjointNode(),
        'showSubclassRelations': Filters.getIncludeSubclassRelations(),
        'loading': (Requests.getPendingRequests() > 0)
      };

      scope.$watch(function () {
        return angular.element($window)[0].innerWidth;
      }, function () {
        scope.render(scope.data);
      });

      scope.$watch('data.nodes.size', function nodeNumberChanged() {
        $log.debug('[Graph] Number of nodes has changed!');
        return scope.render(scope.data);
      });

      scope.$watch(function () {
        return Filters.getIncludeDataTypes();
      },
      function (newVal) {
        scope.data.showTypes = newVal;
        return scope.render(scope.data);
      });

      scope.$watch(function () {
          return Filters.getIncludeLoops();
        },
        function (newVal) {
          scope.data.showLoops = newVal;
          return scope.render(scope.data);
        });

      scope.$watch(function () {
          return Filters.getIncludeDisjointNode();
        },
        function (newVal) {
          scope.data.showDisjointNode = newVal;
          return scope.render(scope.data);
        });

      scope.$watch(function () {
          return Filters.getIncludeSubclassRelations();
        },
        function (newVal) {
          scope.data.showSubclassRelations = newVal;
          return scope.render(scope.data);
        });

      /**
       * Watch for data changes, and consider time difference since last update, otherwise there may be too much
       * refreshes if responses are cached.
       */
      scope.$watch('data', function(newData) {
        if (lastUpdate === null) {
          // first update, store current time and render
          lastUpdate = new Date();
          return scope.render(newData);
        } else {
          // another update, check how much time has passed since last update
          const currentTime = new Date();
          if ((currentTime - lastUpdate) > minUpdateInterval) {
            lastUpdate = currentTime;
            return scope.render(newData);
          }
        }
      }, true);

      scope.$on('toggled-layout', function (event, paused) {
        scope.paused = paused;
        if (scope.force !== undefined) {
          if (paused) {
            scope.force.stop();
          } else {
            scope.force.resume();
          }
        }
      });

      scope.$on('prefixes-changed', function () {
        scope.color = d3.scale.linear().domain([1, Prefixes.size()])
          .interpolate(d3.interpolateHsl)
          .range(colorRange);
        scope.render(scope.data);
      });

      scope.$on('edge-length-changed', function (){
        if (scope.force !== undefined) {
          scope.force.start();
        }
      });

      scope.$on('properties-changed', function () {
        scope.render(scope.data);
      });

      scope.$on('pending-requests-changed', function(event, pending) {
        scope.data.loading = (pending > 0);
        scope.drawPlaceholder(scope.data, width, height);
      });

      scope.lineColor = d3.scale.log()
                          .base(2)
                          .domain([1, 32])
                          .range(['#000', '#777'])
                          .clamp(true);

      scope.arrowColor = d3.scale.ordinal()
                          .domain([5, 6, 7, 8, 9])
                          .range(['#777', '#666', '#555', '#333', '#000']);

      scope.cardinalSpline = d3.svg.line()
        .x(function (d) { return (d !== undefined) ? d.x : 0; })
        .y(function(d) { return (d !== undefined) ? d.y : 0; })
        .interpolate('cardinal');

      scope.loopSpline = d3.svg.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .interpolate('cardinal')
        .tension(0);

      scope.linearLine = d3.svg.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; })
        .interpolate('linear');

      scope.drag = d3.behavior.drag()
        .on('dragstart', function dragstart(d) {
          d.fixed = true;

          d3.select(this).classed('dragged', true);

          if (scope.paused) {
            scope.force.stop();
          } else {
            // when layout is NOT paused, it must be resumed, otherwise all other nodes will stay at its place
            scope.force.resume();
          }

          // needed to make panning and dragging of nodes work
          d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', function dragmove(d) {
          d.px += d3.event.dx;
          d.py += d3.event.dy;
          d.x += d3.event.dx;
          d.y += d3.event.dy;
          scope.tick();
        })
        .on('dragend', function dragend(d) {
          d.fixed = false;

          d3.select(this).classed('dragged', false);

          scope.tick();
          if (!scope.paused) {
            scope.force.resume();
          }
        });

      /** --- Functions --- */

      /**
       * Check whether given node should be shown.
       * 
       * @param {{type: string}} n - the node which should be checked against filters
       * @return {boolean} true if given node will be shown, false otherwise
       */
      scope.filterNodes = function(n) {
        let acceptNode = false;
        if (n.type === 'property' && n.hasOwnProperty('isLoopNode') && n.isLoopNode) {
          if (scope.data.showLoops) {
            acceptNode = true;
          }
        } else if (n.type === 'type' || n.type === 'datatypeProperty') {
          if (scope.data.showTypes) {
            acceptNode = true;
          }
        } else if (n.type === 'disjointNode') {
          if (scope.data.showDisjointNode) {
            acceptNode = true;
          }
        } else if (n.type === 'subClassProperty') {
          if (scope.data.showSubclassRelations) {
            acceptNode = true;
          }
        } else {
          acceptNode = true;
        }

        return acceptNode;
      };

      /**
       * Check whether a given property should be shown or not.
       * 
       * @param {{source: string, type: string, target:string}} prop - the property to check against filters
       * @return {boolean} true if given property will be shown, false otherwise
       */
      scope.filterProps = function (prop) {
          let showProp = true;

          if ((prop.source === prop.target && !scope.data.showLoops) ||
              (prop.type === 'disjointProperty' && !scope.data.showDisjointNode) ||
              (prop.type === 'subClassProperty' && !scope.data.showSubclassRelations)) {
                showProp = false;
          }

          return showProp;
      };

      scope.getMarkerEnd = function (type, value) {
        const size = parseInt(Math.min(Math.log2(value + 2), 5));
        return `url(#${type}Arrow${size})`;
      };

      scope.calcRadius = function (element) {
        var scale = d3.scale.sqrt()
                        .domain([0, scope.maxValue])
                        .range([defaultRadius, 65]);
        return scale(element.value);
      };

      /**
       * Handles the selection of graph items like classes, properties and types.
       *
       * @param {{id: string, type: string, uri: string}} d - the data of the selected item
       * @returns {*}
       */
      scope.updateActive = function (d) {
        if (d3.event.defaultPrevented) {
          return;
        }

        if (d.type === 'property' || d.type === 'datatypeProperty' || d.type === 'subClassProperty' ||
            d.type === 'type') {
          // uri may occur multiple times
          scope.data.selectedId = d.id;
        } else {
          scope.data.selectedId = '';
        }

        scope.data.selected = d.uri;

        let message = {};

        if (d.type === 'property' || d.type === 'datatypeProperty' || d.type === 'subClassProperty') {
          $log.debug(`[Graph] Selected property '${d.uri}'.`);

          // create message and store basic information
          message.item = {
            id: d.id,
            type: d.type
          };

          // get relation and nodes involved
          const prop = Properties.getByNodeId(d.id);
          if (prop !== undefined) {
            const sourceNode = Nodes.getById(prop.source);
            const targetNode = Nodes.getById(prop.target);

            // add source and target node information
            if (sourceNode !== undefined) {
              message.item.sourceName = sourceNode.name;
              message.item.sourceURI = sourceNode.uri;
            }

            if (targetNode !== undefined) {
              message.item.targetName = targetNode.name;
              message.item.targetURI = targetNode.uri;
            }
          } else {
            $log.error(`[Graph] Could not find property by id '${d.id}'!`);
          }

          message.item.ordered = true;

          if (d.type === 'subClassProperty') {
            message.item.commonCount = d.commonInstances;
          } else {
            message.item.props = prop.props.slice();
          }
        } else {
          $log.debug(`[Graph] Selected class '${d.uri}'.`);
          message.item = d;
        }

        // send message to onClick function
        return scope.onClick(message);
      };

      /**
       * Redraws the current view of the graph e.g. for zoom.
       */
      scope.redraw = function () {
        root.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);

        // save current view
        View.setTranslate(d3.event.translate);
        View.setScale(d3.event.scale);

        scope.scale = d3.event.scale;
        scope.translate = d3.event.translate;
      };

      /**
       * Creates the arrowheads in the given linkContainer.
       *
       * @param {*} linkContainer
       */
      scope.createArrowHeads = function (linkContainer) {
        linkContainer.append('defs').selectAll('marker')
          .data(GraphUtils.getArrowHeads())
          .enter().append('marker')
          .attr('id', function (d) { return d.id; })
          .attr('class', function (d) { return d.class; })
          .attr('viewBox', function (d) {
            return '-1 ' + ((d.size + 1) * (-1)) + ' ' + ((d.size + 1) * 2) + ' ' + ((d.size + 1) * 2);
          })
          .attr('refX', function (d) { return d.size * 2;})
          .attr('refY', 0)
          .attr('markerWidth', function (d) { return d.size; })
          .attr('markerHeight', function (d) { return d.size; })
          .attr('orient', 'auto')
          .style('stroke', function (d) {
            return (d.class === 'hovered') ? '#f00' : scope.arrowColor(d.size);
          })
          .style('fill', function (d) {
            if (d.class === 'hovered') {
              return '#f00';
            } else if (d.class === 'subclass') {
              return '#fff';
            } else {
              return scope.arrowColor(d.size);
            }
          })
          .append('path')
            .attr('d', function (d) {
              return `M0,${d.size * -1}L${d.size * 2},0L0,${d.size}Z`;
            });
      };

      scope.setUpNodes = function (root, data, nodes) {
        scope.node = nodeContainer.selectAll('.node')
          .data(nodes);

        scope.node.enter()
          .append('g')
          .classed('node', true)
          .classed('class', function (d) { return d.type === 'class'; })
          .classed('equivalent', function (d) { return d.hasEquivalent !== undefined; })
          .classed('property', function (d) { return d.type === 'property'; })
          .classed('datatypeProperty', function (d) { return d.type === 'datatypeProperty'; })
          .classed('subClassProperty', function (d) { return d.type === 'subClassProperty'; })
          .classed('type', function (d) { return d.type === 'type'; })
          .classed('active', function(d) { return d.uri === data.selected; })
          .classed('activeIndex', function (d) { return d.id === data.selectedId; })
          .classed('external', function (d) {
            return (d.type === 'class' || d.type === 'property') && !(Prefixes.isInternal(d.uri));
          })
          .classed('disjointNode', function (d) { return d.type === 'disjointNode'; })
          .call(scope.drag);

        scope.node.exit().remove();

        // draw a ring for equivalent classes
        nodeContainer.selectAll('.equivalent')
          .append('circle')
          .attr('r', function (d) { return d.radius + ringWidth + 'px'; })
          .style('fill', '#fff');

        nodeContainer.selectAll('.class')
          .append('circle')
          .classed('clazz', true)
          .attr('r', function (d) { return d.radius + 'px'; })
          .on('click', scope.updateActive)
          .on('mouseover', function () {
            d3.select(this).style('fill', '#f00');
          })
          .on('mouseout', function () {
            d3.select(this).style('fill', '#acf');
          })
          .append('title')
          .text(function(d) { return d.uri; });

        // external color for class nodes
        nodeContainer.selectAll('.external circle.clazz')
          .style('fill', function (d) { return scope.color(Prefixes.getColor(d.uri)); })
          .on('mouseout', function (d) {
            d3.select(this).style('fill', scope.color(Prefixes.getColor(d.uri)));
          });

        nodeContainer.selectAll('.property')
          .append('rect')
          .classed('propz', true)
          .attr('x', (d) => GraphUtils.calcPropBoxOffset(d))
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', (d) => GraphUtils.calcPropBoxWidth(d))
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .on('mouseover', function () {
            d3.select(this).style('fill', '#f00');
          })
          .on('mouseout', function () {
            d3.select(this).style('fill', '#acf');
          })
          .append('title')
          .text(function(d) { return GraphUtils.getName(d, false, false); });

        nodeContainer.selectAll('.external rect.propz')
          .style('fill', function (d) { return scope.color(Prefixes.getColor(d.uri)); })
          .on('mouseout', function (d) {
            d3.select(this).style('fill', scope.color(Prefixes.getColor(d.uri)));
          });

        nodeContainer.selectAll('.datatypeProperty')
          .append('rect')
          .attr('x', (d) => GraphUtils.calcPropBoxOffset(d))
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', (d) => GraphUtils.calcPropBoxWidth(d))
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return GraphUtils.getName(d, false, false); });

        nodeContainer.selectAll('.subClassProperty')
          .append('rect')
          .attr('x', (d) => GraphUtils.calcPropBoxOffset(d))
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', (d) => GraphUtils.calcPropBoxWidth(d))
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return GraphUtils.getName(d, false, false); });

        nodeContainer.selectAll('.type')
          .append('rect')
          .attr('x', (d) => GraphUtils.calcPropBoxOffset(d))
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', (d) => GraphUtils.calcPropBoxWidth(d))
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return GraphUtils.getName(d, false, false); });

        scope.setUpDisjointNode(nodeContainer);

        // for classes, properties, datatype properties and types
        scope.node.append('text')
          .attr('class', 'text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .text(function(d) {
            if (d.type === 'class' && d.radius !== undefined) {
              return GraphUtils.getNameForSpace(d, d.radius*2);
            } else {
              return GraphUtils.getName(d, (d.type === 'property' || d.type === 'datatypeProperty'), true);
            }
          });

        // external background colors are rather dark, so the text should be white
        nodeContainer.selectAll('.external text')
                      .style('fill', 'white');
      }; // end of setUpNodes()

      scope.setUpDisjointNode = function (nodeContainer) {

        // draw the box for the disjoint node
        nodeContainer.selectAll('.disjointNode')
          .append('rect')
          .attr('x', -1 * (scope.disjointNodeWidth / 2))
          .attr('y', -1 * (scope.disjointNodeHeight / 2))
          .attr('width', scope.disjointNodeWidth)
          .attr('height', scope.disjointNodeHeight);

        // first circle
        nodeContainer.selectAll('.disjointNode')
          .append('circle')
          .classed('symbol', true)
          .attr('cx', -10)
          .attr('r', 8);

        // second circle
        nodeContainer.selectAll('.disjointNode')
          .append('circle')
          .classed('symbol', true)
          .attr('cx', 10)
          .attr('r', 8);
      }; // end of setUpDisjointNode()

      scope.setUpLinks = function(bilinks) {
        scope.createArrowHeads(linkContainer);

        var links1 = scope.link = linkContainer.selectAll('g.link')
          .data(bilinks);

        var linksG = links1.enter()
          .append('g')
          .attr('class', 'link')
          .style('stroke', function (d) { return scope.lineColor(d.value); });

        scope.link = linksG.append('path')
          .attr('class', 'link-line')
          .classed('subClassProperty', function (d) { return d.type === 'subClassProperty'; });

        links1.exit().remove();

        linkContainer.selectAll('.link-line')
          .attr('marker-end', function(d) { return scope.getMarkerEnd('', d.value); })
          .style('stroke-width', function (d) {
            return Math.min(Math.log2(d.value + 2), 5);
          })
          .on('mouseover', function () {
            d3.select(this).attr('stroke', 'red');
            d3.select(this).attr('marker-end', function (d) { return scope.getMarkerEnd('hovered', d.value); });
          })
          .on('mouseout', function () {
            d3.select(this).attr('stroke', function (d) { return scope.lineColor(d.value); });
            d3.select(this).attr('marker-end', function (d) { return scope.getMarkerEnd('', d.value); });
          });

        linkContainer.selectAll('.subClassProperty')
          .attr('marker-end', function(d) { return scope.getMarkerEnd('subclass', d.value); })
          .on('mouseout', function () {
            d3.select(this).attr('stroke', function (d) { return scope.lineColor(d.value); });
            d3.select(this).attr('marker-end', function (d) { return scope.getMarkerEnd('subclass', d.value); });
          })
          .style('stroke-dasharray', '5, 5');
      };

      scope.setUpDirectLinks = function (directLinks) {
        //var linkContainer = root.select('.linkContainer');

        scope.directLink = linkContainer.selectAll('.direct-link')
                      .data(directLinks)
                      .enter()
                      .append('g')
                      .append('path')
                      .classed('disjointProperty', function (d) { return d.type === 'disjointProperty'; });

        linkContainer.selectAll('.disjointProperty')
          .attr('marker-end', 'none')
          .style('stroke-dasharray', '5, 5');
      };

      /**
       * Recalculates the given line and returns the spline for it.
       * 
       * @param {{source, intermediate, target}} d - the line to be recalculated
       * @return {*}
       */
      scope.recalculateLines = function(d) {
        // check whether current line is a loop
        if (d.source.id === d.target.id) {
          return scope.loopSpline(Links.getLoopData(d));
        } else {
          return scope.cardinalSpline(Links.getLineData(d));
        }
      };

      /**
       * Recalculates a direct line for the given data.
       * 
       * @param {{source, target}} d
       * @returns {*} the linear line
       */
      scope.recalculateDirectLines = function (d) {
        let lineData = [];

        if (d.source !== undefined && d.target !== undefined) {
          lineData.push({x: d.source.x, y: d.source.y});
          lineData.push({x: d.target.x, y: d.target.y});
        }

        return scope.linearLine(lineData);
      };

      scope.findNode = function (nodeId) {
        return scope.nodesToDraw.find(function (node) {
          return node.id === nodeId;
        });
      };

      /**
       * Draws or redraws a placeholder on the graph while classes are loaded or no endpoint is selected.
       * 
       * @param {{nodes: Map}} data
       * @param {number} width
       * @param {number} height
       */
      scope.drawPlaceholder = function (data, width, height) {

        // only show it if there are no nodes
        if (data.nodes.size === 0) {
          $log.debug(`[Graph] Redraw placeholder! Loading: ${scope.data.loading}`);
          let boxHeight = 35;
          let transitionDuration = 750;

          if (scope.data.loading) {
            let boxWidth = 200;
            let centerX = (width - boxWidth) / 2;
            let centerY = Math.max(((height - boxHeight) / 2), 50);

            notificationText.text('Loading classes...')
              .attr('x', centerX + 5)
              .attr('y', centerY - 24)
              .transition()
                .duration(transitionDuration)
                .style('opacity', 1.0);
          } else {
            let boxWidth = 350;
            let centerX = (width - boxWidth) / 2;
            let centerY = Math.max(((height - boxHeight) / 2), 50);

            const resultCodes = Requests.getStatus();

            let message;
            if (resultCodes.length > 0) {
              switch (resultCodes[0]) {
                case -1:
                  message = 'Given SPARQL endpoint is not accessible.';
                  break;

                case 400:
                  message = 'Given SPARQL endpoint does not understand query.';
                  break;

                case 404:
                  message = 'Given SPARQL endpoint could not be found!';
                  break;

                case 500:
                  message = 'Given SPARQL endpoint returned an error.';
                  break;

                case 503:
                  message = 'Given SPARQL endpoint is temporally unavailable.';
                  break;

                default:
                  message = `Extraction failed with unknown error '${resultCodes[0]}'.`;
                  break;
              }
            } else {
              message = 'No classes found!';
            }

            notificationText.text(message)
              .attr('x', centerX + 5)
              .attr('y', centerY - 24)
              .transition()
                .duration(transitionDuration)
                .style('opacity', 1.0);
          }
        } else {
          notificationText.attr('display', 'none');
        }
      };

      /**
       * Function which creates the graph.
       *
       * @param {{nodes, properties, showTypes}} data
       */
      scope.render = function (data) {

        // stop force layout if already created
        if (scope.force.stop !== undefined) {
          scope.force.stop();
        }

        // clear all elements
        nodeContainer.selectAll('*').remove();
        linkContainer.selectAll('*').remove();

        if (!data || data.nodes === undefined) {
          return;
        }

        // restore view
        root.attr('transform', `translate(${scope.translate})scale(${scope.scale})`);

        // set up zoom
        scope.zoom.on('zoom', scope.redraw);
        scope.zoom.translate(scope.translate)
          .scale(scope.scale);
        svg.call(scope.zoom);

        scope.maxValue = 0;

        scope.nodesToDraw = Array.from(data.nodes.values())
                                  .filter(scope.filterNodes)
                                  .map(function (currentNode) {
                                    if (currentNode.value > scope.maxValue) {
                                      scope.maxValue = currentNode.value;
                                    }
                                    return currentNode;
                                  });

        let links = [];
        let bilinks = [];
        let directLinks = [];

        if (data.properties !== undefined) {
          data.properties.filter(scope.filterProps)
                          .forEach(function processProps(link) {

            let s = scope.findNode(link.source);
            let t = scope.findNode(link.target);

            if (link.type !== 'disjointProperty') {
              let i = scope.findNode(link.intermediate);

              if (s === undefined || i === undefined || t === undefined) {
                // incomplete property, not sure why this happens, finally all properties seem to be shown anyway...
                return;
              }

              // get direct class links
              if (s.type !== 'property' && t.type !== 'property') {

                let linkType = 'property';

                if (t.type === 'type') {
                  if (data.showTypes) {
                    linkType = 'datatypeProperty';
                  } else {
                    return;
                  }
                }

                i.value = link.value;

                // create two links
                links.push({source: s, target: i, type: linkType});
                links.push({source: i, target: t, type: linkType});
                bilinks.push({source: s, intermediate: i, target: t, value: link.value, type: link.type});
              }
            } else {

              // for disjoint properties
              if (s !== undefined && t !== undefined) {
                links.push({source: s, target: t, type: link.type});
                directLinks.push({source: s, target: t, value: link.value, type: link.type});
              }
            }
          }); // end of forEach()
        } // end of if data.properties are defined

        // set up dimensions
        width = d3.select(element[0]).node().offsetWidth - margin;

        scope.drawPlaceholder(data, width, height);

        // create force layout
        scope.force = d3.layout.force()
          .charge(-500)
          .linkStrength(1.0)
          .linkDistance(Links.getDistance)
          .gravity(0.03)
          .size([width, height]);

        svg.attr('width', width)
          .attr('height', Math.max(height - 60, 0));

        scope.nodesToDraw.forEach(function (node) {
          node.radius = scope.calcRadius(node);
        });

        scope.force.nodes(scope.nodesToDraw)
                    .links(links);

        scope.setUpLinks(bilinks);

        scope.setUpDirectLinks(directLinks);
        scope.setUpNodes(root, data, scope.nodesToDraw);

        scope.force.start();

        scope.force.on('tick', scope.tick);
      }; // end of scope.render()

      scope.tick = function () {
        scope.link.attr('d', scope.recalculateLines);
        scope.directLink.attr('d', scope.recalculateDirectLines);
        scope.node.attr('transform', function nodeTransform(d) { return `translate(${d.x},${d.y})`; });
      };
    } // end of link()
  }; // end of returned directive
} // end of NodeLinkGraph()

export default NodeLinkGraph;
