'use strict';

var d3 = require('d3');

/**
 * @Name nodeLinkGraph
 *
 * @param $window
 * @param $log
 * @param Properties
 * @param Nodes
 * @param Prefixes
 * @param Filters
 * @param Geometry
 * @param Utils
 *
 * @returns {{restrict: string, scope: {data: string, onClick: string}, link: link}}
 */
module.exports = function ($window, $log, Properties, Nodes, Prefixes, Filters, Geometry, Utils) {
  return {
    restrict: 'EA',
    scope: {
      data: '=', // bidirectional data-binding
      onClick: '&' // parent execution
    },
    link: function (scope, element, attrs) {
      var margin = parseInt(attrs.margin) || 20;
      var height = parseInt(attrs.height) || $window.innerHeight;

      var colorRange = [d3.rgb("#3366CC"), d3.rgb('#EE2867')];

      var defaultRadius = 20;

      var defaultPropHeight = 20;
      var ringWidth = 4;
      var svg = d3.select(element[0])
                  .append('svg')
                  .style('width', '100%');

      var root = svg.append("g");

      var lastUpdate = null;

      var minUpdateInterval = 1500;

      // Browser onresize event
      $window.onresize = function () {
        height = $window.innerHeight;
        svg.attr('height', height-60);
        scope.$apply();
      };

      scope.propDistance = 80;
      scope.dtPropDistance = 20;
      scope.disjunctPropDistance = 100;

      scope.disjunctNodeWidth = 60;
      scope.disjunctNodeHeight = 30;

      scope.node = {};
      scope.force = {};
      scope.cardinalSpline = {};
      scope.loopSpline = {};
      scope.linearLine = {};

      scope.color = d3.scale.linear().domain([1, Prefixes.size()])
        .interpolate(d3.interpolateHsl)
        .range(colorRange);

      scope.data = {
        'nodes': Nodes.getNodes(),
        'properties': Properties.getProperties(),
        'prefixes': Prefixes.getPrefixes(),
        'showTypes': Filters.getIncludeLiterals(),
        'showLoops': Filters.getIncludeLoops(),
        'showDisjunctNode': Filters.getIncludeDisjunctNode()
      };

      scope.$watch(function () {
        return angular.element($window)[0].innerWidth;
      }, function () {
        scope.render(scope.data);
      });

      scope.$watch('data.nodes.size', function () {
        $log.debug("[Graph] Number of nodes has changed!");
        return scope.render(scope.data);
      });

      scope.$watch(function () {
          return Filters.getIncludeLiterals();
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
          return Filters.getIncludeDisjunctNode();
        },
        function (newVal) {
          scope.data.showDisjunctNode = newVal;
          return scope.render(scope.data);
        });

      /**
       * Watch for data changes, and consider time difference since last update, otherwise there may be too much
       * refreshes if responses are cached.
       */
      scope.$watch('data', function(newVals) {
        //$log.debug("[Graph] Needs Update!");

        if (lastUpdate === null) {
          // first update, store current time and render
          lastUpdate = new Date();
          return scope.render(newVals);
        } else {
          // another update, check how much time has passed since last update
          var currentTime = new Date();
          if ((currentTime - lastUpdate) > minUpdateInterval) {
            lastUpdate = currentTime;
            return scope.render(newVals);
          }
        }
      }, true);

      scope.$on('prefixes-changed', function () {
        scope.color = d3.scale.linear().domain([1, Prefixes.size()])
          .interpolate(d3.interpolateHsl)
          .range(colorRange);
        scope.render(scope.data);
      });

      scope.$on('ccEdgeLength-changed', function (event, newPropDistance) {
        scope.propDistance = newPropDistance;
        if (scope.force !== undefined) {
          scope.force.start();
        }
      });

      scope.$on('ctEdgeLength-changed', function (event, newDtPropDistance) {
        scope.dtPropDistance = newDtPropDistance;
        if (scope.force !== undefined) {
          scope.force.start();
        }
      });

      scope.lineColor = d3.scale.log()
                          .base(2)
                          .domain([1, 32])
                          .range(['#000', '#777'])
                          .clamp(true);

      scope.arrowColor = d3.scale.ordinal()
                          .domain([5, 6, 7, 8, 9])
                          .range(['#777', '#666', '#555', '#333', '#000']);

      scope.getArrowHeads = function () {
        var arrowHeads = [];

        for (var lwidth = 1; lwidth <= 5; lwidth++) {
          arrowHeads.push({id: 'Arrow' + lwidth, class: 'arrow', size: 10-lwidth});
          arrowHeads.push({id: 'hoveredArrow' + lwidth, class: 'hovered', size: 10-lwidth});
          arrowHeads.push({id: 'subclassArrow' + lwidth, class: 'subclass', size: 10-lwidth});
        }

        return arrowHeads;
      };

      scope.getMarkerEnd = function (type, value) {
        var size = parseInt(Math.min(Math.log2(value + 2), 5));
        return "url(#" + type + 'Arrow' +  size + ")";
      };

      scope.calcRadius = function (element) {
        var scale = d3.scale.sqrt();
        scale.domain([0, scope.maxValue]);
        scale.range ([defaultRadius, 65]);
        return scale(element.value);
      };

      scope.calcPropHighlightBoxWidth = function (d) {
        return scope.calcPropBoxWidth(d) + 2 * ringWidth;
      };

      scope.calcPropBoxWidth = function (d) {
        return (Utils.getName(d, true, true).length * 8);
      };

      scope.calcPropBoxOffset = function (d) {
        return (-1) * (scope.calcPropBoxWidth(d) / 2);
      };

      scope.calcPropHighlightOffset = function (d) {
        return (-1) * (scope.calcPropHighlightBoxWidth(d) / 2);
      };

      /**
       * Handles the selection of graph items like classes, properties and types.
       *
       * @param d - the data of the selected item
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

        var message = {};

        if (d.type === 'property' || d.type === 'datatypeProperty' || d.type === 'subClassProperty') {

          $log.debug("[Graph] Selected property '" + d.uri + "'.");

          // get relation and nodes involved
          var prop = Properties.getByNodeId(d.id);
          var sourceNode = Nodes.getById(prop.source);
          var targetNode = Nodes.getById(prop.target);

          // create message and store basic information
          message.item = {};
          message.item.id = d.id;
          message.item.type = d.type;

          // add source and target node information
          message.item.sourceName = sourceNode.name;
          message.item.sourceURI = sourceNode.uri;
          message.item.targetName = targetNode.name;
          message.item.targetURI = targetNode.uri;

          //TODO add ordered attribute
          message.item.ordered = true;

          if (d.type === 'subClassProperty') {
            message.item.commonCount = d.commonInstances;
          } else {
            message.item.props = prop.props.slice();
          }
        } else {
          $log.debug("[Graph] Selected class '" + d.uri + "'.");
          message.item = d;
        }

        // send message to onClick function
        return scope.onClick(message);
      };

      scope.redraw = function () {
        root.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')');
      };

      // TODO move geo functions into another module

      /**
       * Creates the arrowheads in the given linkContainer.
       *
       * @param linkContainer
       */
      scope.createArrowHeads = function (linkContainer) {
        linkContainer.append("defs").selectAll("marker")
          .data(scope.getArrowHeads())
          .enter().append("marker")
          .attr("id", function (d) {
            return d.id;
          })
          .attr("class", function (d) {
            return d.class;
          })
          .attr("viewBox", function (d) {
            return "-1 " + ((d.size + 1) * (-1)) + " " + ((d.size + 1) * 2) + " " + ((d.size + 1) * 2);
          })
          .attr("refX", function (d) {
            return d.size * 2;
          })
          .attr("refY", 0)
          .attr("markerWidth", function (d) {
            return d.size;
          })
          .attr("markerHeight", function (d) {
            return d.size;
          })
          .attr("orient", "auto")
          .style("stroke", function (d) {
            return (d.class === 'hovered') ? 'red' : scope.arrowColor(d.size);
          })
          .style("fill", function (d) {
            if (d.class === 'hovered') {
              return 'red';
            } else if (d.class === 'subclass') {
              return 'white';
            } else {
              return scope.arrowColor(d.size);
            }
          })
          .append("path")
            .attr("d", function (d) {
              return "M0," + (d.size * -1) + "L" + (d.size * 2) + ",0L0," + d.size + "Z";
            });
      };

      scope.setUpNodes = function (root, data, nodes) {
        var nodeContainer = root.append('g')
          .attr('class', 'nodeContainer');

        scope.node = nodeContainer.selectAll('.node')
          .data(nodes);

        scope.node.enter()
          .append('g')
          .classed('node', true)
          .classed('class', function (d) { return d.type === 'class'; })
          .classed('equivalent', function (d) {return d.equivalentURI !== undefined; })
          .classed('property', function (d) { return d.type === 'property'; })
          .classed('datatypeProperty', function (d) { return d.type === 'datatypeProperty'; })
          .classed('subClassProperty', function (d) { return d.type === 'subClassProperty'; })
          .classed('type', function (d) { return d.type === 'type'; })
          .classed('active', function(d) { return d.uri === data.selected; })
          .classed('activeIndex', function (d) { return d.id === data.selectedId; })
          .classed('external', function (d) {
            return (d.type === 'class' || d.type === 'property') && !(Prefixes.isInternal(d.uri));
          })
          .classed('disjunctNode', function (d) { return d.type === 'disjunctNode'; })
          .call(scope.force.drag);

        scope.node.exit().remove();

        scope.cardinalSpline = d3.svg.line()
          .x(function (d) { return (d !== undefined) ? d.x : 0; })
          .y(function(d) { return (d !== undefined) ? d.y : 0; })
          .interpolate("cardinal");

        scope.loopSpline = d3.svg.line()
          .x(function (d) { return d.x; })
          .y(function (d) { return d.y; })
          .interpolate("cardinal")
          .tension(0);

        scope.linearLine = d3.svg.line()
          .x(function (d) { return d.x; })
          .y(function (d) { return d.y; })
          .interpolate("linear");

        // draw a ring for equivalent classes
        nodeContainer.selectAll('.equivalent')
          .append('circle')
          .attr('r', function (d) { return d.radius + ringWidth + 'px'; })
          .style('fill', '#fff');

        nodeContainer.selectAll('.class')
          .append('circle')
          .classed('clazz', true)
          .attr('r', function (d) { return d.radius + "px"; })
          .on('click', scope.updateActive)
          .on('mouseover', function () {
            d3.select(this).style('fill', 'red');
          })
          .on('mouseout', function (d) {
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
          .attr('x', scope.calcPropBoxOffset)
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', scope.calcPropBoxWidth)
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return Utils.getName(d, false, false); });

        nodeContainer.selectAll('.external rect')
          .style('fill', function (d) { return scope.color(Prefixes.getColor(d.uri)); })
          .on('mouseout', function (d) {
            d3.select(this).style('fill', scope.color(Prefixes.getColor(d.uri)));
          });

        nodeContainer.selectAll('.datatypeProperty')
          .append('rect')
          .attr('x', scope.calcPropBoxOffset)
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', scope.calcPropBoxWidth)
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return Utils.getName(d, false, false); });

        nodeContainer.selectAll('.subClassProperty')
          .append('rect')
          .attr('x', scope.calcPropBoxOffset)
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', scope.calcPropBoxWidth)
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return Utils.getName(d, false, false); });

        nodeContainer.selectAll('.type')
          .append('rect')
          .attr('x', scope.calcPropBoxOffset)
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', scope.calcPropBoxWidth)
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return Utils.getName(d, false, false); });

        scope.setUpDisjunctNode(nodeContainer);

        // for classes, properties, datatype properties and types
        scope.node.append('text')
          .attr('class', 'text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .text(function(d) {
            if (d.type === 'class' && d.radius !== undefined) {
              return Utils.getNameForSpace(d, d.radius*2);
            } else {
              return Utils.getName(d, (d.type === 'property'), true);
            }
          });

        // external background colors are rather dark, so the text should be white
        nodeContainer.selectAll('.external text')
          .style('fill', 'white');
      }; // end of setUpNodes()

      scope.setUpDisjunctNode = function (nodeContainer) {

        // draw the box for the disjunct node
        nodeContainer.selectAll('.disjunctNode')
          .append('rect')
          .attr('x', -1 * (scope.disjunctNodeWidth / 2))
          .attr('y', -1 * (scope.disjunctNodeHeight / 2))
          .attr('width', scope.disjunctNodeWidth)
          .attr('height', scope.disjunctNodeHeight)
          .style('fill', '#acf');

        // first circle
        nodeContainer.selectAll('.disjunctNode')
          .append('circle')
          .classed('symbol', true)
          .attr('cx', -15)
          .attr('r', 10);

        // second circle
        nodeContainer.selectAll('.disjunctNode')
          .append('circle')
          .classed('symbol', true)
          .attr('cx', 15)
          .attr('r', 10);
      }; // end of setUpDisjunctNode()

      scope.setUpLinks = function(bilinks) {
        var linkContainer = root.append('g')
          .attr('class', 'linkContainer');

        scope.createArrowHeads(linkContainer);

        var links1 = scope.link = linkContainer.selectAll("g.link")
          .data(bilinks);

        var linksG = links1.enter()
          .append("g")
          .attr("class", "link")
          .style("stroke", function (d) { return scope.lineColor(d.value); });

        scope.link = linksG.append("path")
          .attr("class", "link-line")
          .classed('subClassProperty', function (d) { return d.type === 'subClassProperty'; });

        links1.exit().remove();

        linkContainer.selectAll('.link-line')
          .attr("marker-end", function(d) { return scope.getMarkerEnd('', d.value); })
          .style("stroke-width", function (d) {
            return Math.min(Math.log2(d.value + 2), 5);
          })
          .on('mouseover', function () {
            d3.select(this).attr("stroke", "red");
            d3.select(this).attr("marker-end", function (d) { return scope.getMarkerEnd('hovered', d.value); });
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", function (d) { return scope.lineColor(d.value); });
            d3.select(this).attr("marker-end", function (d) { return scope.getMarkerEnd('', d.value); });
          });

        linkContainer.selectAll('.subClassProperty')
          .attr("marker-end", function(d) { return scope.getMarkerEnd('subclass', d.value); })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", function (d) { return scope.lineColor(d.value); });
            d3.select(this).attr("marker-end", function (d) { return scope.getMarkerEnd('subclass', d.value); });
          })
          .style('stroke-dasharray', '5, 5');
      };

      scope.setUpDirectLinks = function (directLinks) {
        var linkContainer = root.select('.linkContainer');

        scope.directLink = linkContainer.selectAll('.direct-link')
                      .data(directLinks)
                      .enter()
                      .append("g")
                      .style('stroke', '#000')
                      .append("path")
                      .style('stroke-width', 1)
                      .classed('disjunctProperty', function (d) { return d.type === 'disjunctProperty'; });

        linkContainer.selectAll('.disjunctProperty')
          .attr("marker-end", 'none')
          .style('stroke-dasharray', '5, 5');
      };

      scope.recalculateLines = function(d) {
        var line = {};

        // check whether current line is a loop
        if (d.source.id === d.target.id) {

          var loopData = [];

          // for the loops
          loopData.push(Geometry.getAnotherCircleOutlinePoint(d, -1));
          loopData.push({x: d.intermediate.x, y: d.intermediate.y});

          // loops are always towards classes
          loopData.push(Geometry.getAnotherCircleOutlinePoint(d, 1));

          line = scope.loopSpline(loopData);
        } else {

          // non-loop

          var lineData = [];

          // TODO should also start from circumference
          lineData.push({x: d.source.x, y: d.source.y});
          lineData.push({x: d.intermediate.x, y: d.intermediate.y});

          // position depends on node type
          if (d.target.type === 'class') {
            lineData.push(Geometry.getCircleOutlinePoint(d));
          } else {
            lineData.push(Geometry.getRectOutlinePoint(d));
          }

          line = scope.cardinalSpline(lineData);
        }

        return line;
      }; // end of recalculateLines()


      scope.recalculateDirectLines = function (d) {
        var lineData = [];

        if (d.source !== undefined && d.target !== undefined) {
          lineData.push({x: d.source.x, y: d.source.y});
          lineData.push({x: d.target.x, y: d.target.y});
        }

        return scope.linearLine(lineData);
      };

      scope.findNode = function (nodeId) {
        var node;

        for (var i = 0; i < scope.nodesToDraw.length; i++) {
          var currentNode = scope.nodesToDraw[i];
          if (currentNode.id !== undefined && currentNode.id === nodeId) {
            node = currentNode;
            break;
          }
        }

        return node;
      };

      /**
       * Function which creates the graph.
       *
       * @param data
       */
      scope.render = function (data) {

        // stop force layout if already created
        if (scope.force.stop !== undefined) {
          scope.force.stop();
        }

        // clear all elements
        root.selectAll('*').remove();

        if (!data || data.nodes === undefined) {
          return;
        }

        var zoom = d3.behavior.zoom()
                    .duration(150)
                    .scaleExtent([0.1,2.0])
                    .on("zoom", scope.redraw);
        svg.call(zoom);

        scope.maxValue = 0;

        scope.nodesToDraw = [];
        var links = [];
        var bilinks = [];
        var directLinks = [];


        for (var n of data.nodes.values()) {
          var currentValue = n.value;

          if (currentValue > scope.maxValue) {
            scope.maxValue = currentValue;
          }

          if (n.type === 'property' && n.hasOwnProperty('isLoopNode') && n.isLoopNode) {

            // only add if loops should be shown
            if (data.showLoops) {
              scope.nodesToDraw.push(n);
            }
          } else if (n.type === 'type' || n.type === 'datatypeProperty') {

            // only add if types should be shown
            if (data.showTypes) {
              scope.nodesToDraw.push(n);
            }
          } else if (n.type === 'disjunctNode') {
            if (data.showDisjunctNode) {
              scope.nodesToDraw.push(n);
            }
          } else {
            scope.nodesToDraw.push(n);
          }
        } // end of for all nodes

        if (data.properties !== undefined) {
          data.properties.forEach(function (link) {

            // do not add filtered elements
            if ((link.source === link.target && !data.showLoops) ||
               (link.type === 'disjunctProperty' && !data.showDisjunctNode)) {
              return;
            }

            var s = scope.findNode(link.source);
            var t = scope.findNode(link.target);

            if (link.type !== 'disjunctProperty') {
              var i = scope.findNode(link.intermediate);

              if (s !== undefined && i !== undefined && t !== undefined) {

                // get direct class links
                if (s.type !== 'property' && t.type !== 'property') {

                  var linktype = 'property';

                  if (t.type === 'type') {
                    if (data.showTypes) {
                      linktype = 'datatypeProperty';
                    } else {
                      return;
                    }
                  }

                  i.value = link.value;

                  // create two links
                  links.push({source: s, target: i, type: linktype});
                  links.push({source: i, target: t, type: linktype});
                  bilinks.push({source: s, intermediate: i, target: t, value: link.value, type: link.type});
                }
              }
            } else {

              // for disjunct properties
              if (s !== undefined && t !== undefined) {
                links.push({source: s, target: t, type: link.type});
                directLinks.push({source: s, target: t, value: link.value, type: link.type});
              }
            }
          }); // end of forEach()
        } // end of if data.properties are defined

        // set up dimensions
        var width = d3.select(element[0]).node().offsetWidth - margin;

        // create force layout
        scope.force = d3.layout.force()
          .charge(-500)
          .linkStrength(1.0)
          .linkDistance(function (d) {
            var distance = scope.propDistance;

            // datatype properties should have lower distance then normal properties
            if (d.type === 'datatypeProperty') {
              distance = scope.dtPropDistance;
            } else if (d.type === 'disjunctProperty') {
              distance = scope.disjunctPropDistance;
            }

            if (d.source !== undefined && d.source.radius !== undefined) {
              distance += d.source.radius;
            }

            if (d.target !== undefined && d.target.radius !== undefined) {
              distance += d.target.radius;
            }

            return distance;
          })
          .gravity(0.05)
          .size([width, height]);

        // needed to make panning and dragging of nodes work
        scope.force.drag()
          .on('dragstart', function () {
            d3.event.sourceEvent.stopPropagation();
          });

        svg.attr('width', width)
          .attr('height', height - 60);

        scope.nodesToDraw.forEach(function (node) {
          node.radius = scope.calcRadius(node);
        });

        scope.force
          .nodes(scope.nodesToDraw)
          .links(links);

        scope.setUpLinks(bilinks);

        scope.setUpDirectLinks(directLinks);
        scope.setUpNodes(root, data, scope.nodesToDraw);

        scope.force.start();

        scope.force.on('tick', function() {
          scope.link.attr('d', scope.recalculateLines);
          scope.directLink.attr('d', scope.recalculateDirectLines);
          scope.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
      }; // end of scope.render()
    } // end of link()
  }; // end of directive
}; // end of module.exports
