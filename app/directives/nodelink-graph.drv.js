'use strict';

var d3 = require('d3');

/**
 * @Name nodeLinkGraph
 *
 * @param $window
 * @param $log
 * @param Properties
 * @param Nodes
 * @param Utils
 *
 * @returns {{restrict: string, scope: {data: string, onClick: string}, link: link}}
 */
module.exports = function ($window, $log, Properties, Nodes, Prefixes, Filters, Utils) {
  return {
    restrict: 'EA',
    scope: {
      data: '=', // bidirectional data-binding
      onClick: '&' // parent execution
    },
    link: function (scope, element, attrs) {
      var margin = parseInt(attrs.margin) || 20;
      var height = parseInt(attrs.height) || $window.innerHeight;

      var propDistance = 80;
      var dtPropDistance = 20;

      var defaultRadius = 20;

      var maxNameLength = 15;

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

      scope.force = {};

      scope.data = {
        'nodes': Nodes.getNodes(),
        'properties': Properties.getProperties(),
        'prefixes': Prefixes.getPrefixes(),
        'showTypes': Filters.getIncludeLiterals(),
        'showLoops': Filters.getIncludeLoops()
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

      scope.$watch('data.prefixes.length', function () {
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

      scope.lineColor = d3.scale.log()
                          .base(2)
                          .domain([1, 32])
                          .range(['#000', '#777'])
                          .clamp(true);

      scope.arrowColor = d3.scale.ordinal()
                          .domain([5, 6, 7, 8, 9])
                          .range(['#777', '#666', '#555', '#333', '#000']);

      scope.getName = function (obj, values, clip) {
        var name = '';
        clip =  (clip !== undefined) ? clip : false;

        if (obj.name !== undefined && obj.name !== '') {
          name = obj.name;
        } else {
          name = Utils.labelFromURI(obj.uri);
        }

        if (clip && name.length > maxNameLength) {
          name = name.substr(0, maxNameLength-2) + '...';
        }

        if (values && obj.value !== undefined && obj.value > 1) {
          name += ' [' + obj.value + ']';
        }

        return name;
      };

      /**
       * Returns the name which should be displayed for a given object if the width is restricted to a given amount of
       * pixels.
       *
       * @param obj - the object which name should be displayed, must have a name or uri attribute
       * @param maxWidth - the maximum amount of space available (in pixels)
       * @returns {string}
       */
      scope.getNameForSpace = function (obj, maxWidth) {
        var name = '';

        // start will full name from object or its URI
        if (obj !== undefined && obj.hasOwnProperty('name') && obj.name.length > 0) {
          name = obj.name;
        } else {
          name = Utils.labelFromURI(obj.uri);
        }

        // estimate for how many chars there will be space
        var chars = Math.floor(maxWidth / 7);

        // cut name and add ellipsis
        if (chars < name.length) {
          name = name.substr(0, chars - 3) + '...';
        }

        return name;
      };

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
        return (scope.getName(d, true, true).length * 8);
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

      scope.getCircleOutlinePoint = function (d) {
        var deltaX = d.target.x - d.intermediate.x;
        var deltaY = d.target.y - d.intermediate.y;

        // Pythagoras rule
        var totalLength = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

        var radius = d.target.radius;
        var offsetX = (deltaX * (radius)) / totalLength;
        var offsetY = (deltaY * (radius)) / totalLength;

        return {x: (d.target.x - offsetX), y: (d.target.y - offsetY)};
      };

      scope.getRectOutlinePoint = function (d) {
        var m = (d.target.y - d.intermediate.y) / (d.target.x - d.intermediate.x);

        var boxWidth = scope.calcPropBoxWidth(d.target);

        var minX = d.target.x - (boxWidth / 2);
        var maxX = d.target.x + (boxWidth / 2);

        var minY = d.target.y - (defaultPropHeight / 2);
        var maxY = d.target.y + (defaultPropHeight / 2);

        // left side
        if (d.intermediate.x < d.target.x) {
          var minXy = m * (minX - d.intermediate.x) + d.intermediate.y;
          if (minY < minXy && minXy < maxY) {
            return {x: minX, y: minXy};
          }
        }

        // right side
        if (d.intermediate.x >= d.target.x) {
          var maxXy = m * (maxX - d.intermediate.x) + d.intermediate.y;
          if (minY < maxXy && maxXy < maxY) {
            return {x: maxX, y: maxXy};
          }
        }

        // top side
        if (d.intermediate.y < d.target.y) {
          var minYx = (minY - d.intermediate.y) / m + d.intermediate.x;
          if (minX < minYx && minYx < maxX) {
            return {x: minYx, y: minY};
          }
        }

        // bottom side
        if (d.intermediate.y >= d.target.y) {
          var maxYx = (maxY - d.intermediate.y) / m + d.intermediate.x;
          if (minX < maxYx && maxYx < maxX) {
            return {x: maxYx, y: maxY};
          }
        }
      };

      /**
       * Returns true if the given URI is an internal one, false otherwise.
       *
       * @param uri - the URI to be checked
       * @returns {boolean}
       */
      scope.isIntern = function (uri) {

        var match = false;
        for (var i = 0; i < scope.data.prefixes.length; i++) {
          var currentPre = scope.data.prefixes[i];

          if (currentPre.classification === 'intern' && uri.indexOf(currentPre.prefix) !== -1) {
            match = true;
            break;
          }
        }

        return match;
      };

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
              return scope.arrowColor(d.size)
            }
          })
          .append("path")
            .attr("d", function (d) {
              return "M0," + (d.size * -1) + "L" + (d.size * 2) + ",0L0," + d.size + "Z";
            });
      };

      scope.render = function (data) {

        //$log.debug(data);

        scope.data.prefixes = Prefixes.getPrefixes();


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

        var nodes = [];
        var links = [];
        var bilinks = [];

        for (var n of data.nodes.values()) {
          var currentValue = n.value;

          if (currentValue > scope.maxValue) {
            scope.maxValue = currentValue;
          }

          if (n.type === 'property' && n.hasOwnProperty('isLoopNode') && n.isLoopNode) {

            // only add if loops should be shown
            if (data.showLoops) {
              nodes.push(n);
            }
          } else if (n.type === 'type' || n.type === 'datatypeProperty') {

            // only add if types should be shown
            if (data.showTypes) {
              nodes.push(n);
            }
          } else {
            nodes.push(n);
          }
        }

        if (data.properties !== undefined) {
          data.properties.forEach(function (link) {

            if (link.source === link.target && !data.showLoops) {
              return;
            }

            var s = data.nodes.get(link.source);
            var i = data.nodes.get(link.intermediate);
            var t = data.nodes.get(link.target);

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
                links.push({source: s, target: i, type: linktype });
                links.push({source: i, target: t, type: linktype });
                bilinks.push({source: s, intermediate: i, target: t, value: link.value, type: link.type});
              }
            }
          });
        }

        // set up dimensions
        var width = d3.select(element[0]).node().offsetWidth - margin;

        scope.force = d3.layout.force()
          .charge(-800)
          .linkDistance(function (d) {
            // datatype properties should have lower distance then normal properties
            return (d.type === 'datatypeProperty') ? dtPropDistance : propDistance;
          })
          .gravity(0.05)
          .size([width, height]);

        // needed to make panning and dragging of nodes work
        var drag = scope.force.drag()
          .on('dragstart', function () {
            d3.event.sourceEvent.stopPropagation();
          });

        svg.attr('width', width)
          .attr('height', height - 60);

        nodes.forEach(function (node) {
          node.radius = scope.calcRadius(node);
        });

        scope.force.nodes(nodes)
          .links(links)
          .start();

        var linkContainer = root.append('g')
                              .attr('class', 'linkContainer');

        this.createArrowHeads(linkContainer);

        var link = linkContainer.selectAll(".link")
            .data(bilinks)
           .enter()
            .append("g")
            .attr("class", "link")
            .style("stroke", function (d) { return scope.lineColor(d.value); })
            .append("path")
              .attr("class", "link-line")
              .classed('subClassProperty', function (d) { return d.type === 'subClassProperty'; });

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

        var nodeContainer = root.append('g')
                              .attr('class', 'nodeContainer');

        var node = nodeContainer.selectAll('.node')
                      .data(nodes)
                    .enter().append('g')
                    .classed('node', true)
                    .classed('class', function (d) { return d.type === 'class'; })
                    .classed('equivalent', function (d) {return d.equivalentURI !== undefined; })
                    .classed('property', function (d) { return d.type === 'property'; })
                    .classed('datatypeProperty', function (d) { return d.type === 'datatypeProperty'; })
                    .classed('subClassProperty', function (d) { return d.type === 'subClassProperty'; })
                    .classed('type', function (d) { return d.type === 'type'; })
                    .classed('active', function(d) { return d.uri === data.selected; })
                    .classed('activeIndex', function (d) {return d.id === data.selectedId; })
                    .classed('extern', function (d) {
                      return !(scope.data.prefixes[0] !== undefined && scope.isIntern(d.uri));
                    })
                    .call(scope.force.drag);

        var cardinalSpline = d3.svg.line()
                              .x(function (d) { return d.x; })
                              .y(function(d) { return d.y; })
                              .interpolate("cardinal");

        // draw a ring for equivalent classes
        nodeContainer.selectAll('.equivalent')
          .append('circle')
          .attr('r', function (d) { return d.radius + ringWidth + 'px'; })
          .style('fill', '#fff');

        nodeContainer.selectAll('.class')
          .append('circle')
            .attr('r', function (d) { return d.radius + "px"; })
            .on('click', scope.updateActive)
          .append('title')
            .text(function(d) {return d.uri;});

        nodeContainer.selectAll('.property')
          .append('rect')
            .attr('x', scope.calcPropBoxOffset)
            .attr('y', (-1 * (defaultPropHeight / 2)))
            .attr('width', scope.calcPropBoxWidth)
            .attr('height', defaultPropHeight)
            .on('click', scope.updateActive)
            .append('title')
              .text(function(d) { return scope.getName(d, false, false); });

        nodeContainer.selectAll('.datatypeProperty')
          .append('rect')
            .attr('x', scope.calcPropBoxOffset)
            .attr('y', (-1 * (defaultPropHeight / 2)))
            .attr('width', scope.calcPropBoxWidth)
            .attr('height', defaultPropHeight)
            .on('click', scope.updateActive)
            .append('title')
              .text(function(d) { return scope.getName(d, false, false); });

        nodeContainer.selectAll('.subClassProperty')
          .append('rect')
          .attr('x', scope.calcPropBoxOffset)
          .attr('y', (-1 * (defaultPropHeight / 2)))
          .attr('width', scope.calcPropBoxWidth)
          .attr('height', defaultPropHeight)
          .on('click', scope.updateActive)
          .append('title')
          .text(function(d) { return scope.getName(d, false, false); });

        nodeContainer.selectAll('.type')
          .append('rect')
            .attr('x', scope.calcPropBoxOffset)
            .attr('y', (-1 * (defaultPropHeight / 2)))
            .attr('width', scope.calcPropBoxWidth)
            .attr('height', defaultPropHeight)
            .on('click', scope.updateActive)
            .append('title')
              .text(function(d) { return scope.getName(d, false, false); });

        // for classes, properties, datatype properties and types
        node.append('text')
              .attr('class', 'text')
              .attr('dy', '.35em')
              .attr('text-anchor', 'middle')
              .text(function(d) {
                if (d.type === 'class' && d.radius !== undefined) {
                  return scope.getNameForSpace(d, d.radius*2);
                } else {
                  return scope.getName(d, (d.type === 'property'), true);
                }
              });

        scope.force.on('tick', function() {
          link.attr('d', function(d) {
            var lineData = [];
            lineData.push({x: d.source.x, y: d.source.y});
            lineData.push({x: d.intermediate.x, y: d.intermediate.y});

            if (d.target.type === 'class') {
              lineData.push(scope.getCircleOutlinePoint(d));
            } else {
              lineData.push(scope.getRectOutlinePoint(d));
            }

            return cardinalSpline(lineData);
          });

          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
      };
    }
  };
};
