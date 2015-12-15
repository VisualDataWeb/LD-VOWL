'use strict';

var d3 = require('d3');

module.exports = function ($window, Properties, Nodes, Utils) {
  return {
    restrict: 'EA',
    scope: {
      data: '=', // bidirectional data-binding
      onClick: '&' // parent execution
    },
    link: function (scope, element, attrs) {
      var margin = parseInt(attrs.margin) || 20;
      var height = parseInt(attrs.height) || 300;
      var linkDistance = parseInt(attrs.linkDistance) || 60;
      var defaultRadius = 20;

      var defaultPropHeight = 20;
      var ringWidth = 5;
      var svg = d3.select(element[0])
                  .append('svg')
                  .style('width', '100%');

      // Browser onresize event
      $window.onresize = function () {
        scope.$apply();
      };

      scope.force = {};

      scope.data = {
        'nodes': Nodes.getNodes(),
        'properties': Properties.getProperties()
      };

      scope.$watch(function () {
        return angular.element($window)[0].innerWidth;
      }, function () {
        scope.render(scope.data);
      });

      scope.$watch('data', function(newVals) {
        console.log('[Graph] Data changed, re-render graph!');
        return scope.render(newVals);
      }, true);

      scope.getName = function (obj, values) {
        var name = '';
        if (obj.name !== undefined && obj.name !== '') {
          name = obj.name;
        } else {
          name = Utils.labelFromURI(obj.uri);
        }

        if (values && obj.value !== undefined && obj.value > 1) {
          name += ' [' + obj.value + ']';
        }

        return name;
      };

      scope.getArrowHeads = function () {
        var arrowHeads = [];

        for (var lwidth = 1; lwidth <= 5; lwidth++) {
          arrowHeads.push({id: 'arrow' + lwidth, class: 'arrow', size: 9-lwidth});
          arrowHeads.push({id: 'hoveredArrow' + lwidth, class: 'hovered', size: 9-lwidth});
        }

        return arrowHeads;
      };

      scope.getMarkerEnd = function (hovered, value) {
        var type = (hovered) ? "hoveredArrow" : "arrow";
        var size = parseInt(Math.min(Math.log2(value + 2), 5));
        return "url(#" + type + size + ")"
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
        return (scope.getName(d, true).length * 8);
      };

      scope.calcPropBoxOffset = function (d) {
        return (-1) * (scope.calcPropBoxWidth(d) / 2);
      };

      scope.calcPropHighlightOffset = function (d) {
        return (-1) * (scope.calcPropHighlightBoxWidth(d) / 2);
      };

      scope.updateActive = function (d) {
        if (d3.event.defaultPrevented) {
          return;
        }

        if (d.type === 'property') {
          // uri may occur multiple times
          scope.data.selectedIndex = d.index;
        }

        scope.data.selected = d.uri;

        var message = {};

        if (d.type === 'property') {
          console.log("[Graph] Selected property '" + d.uri + "'.");
          message.item = Properties.getByNodeIndex(d.index);

          // add source and target node information
          message.item.sourceNode = Nodes.getByIndex(message.item.source);
          message.item.targetNode = Nodes.getByIndex(message.item.target);

          console.log(message);
        } else {
          console.log("[Graph] Selected class '" + d.uri + "'.");
          message.item = d;
        }

        return scope.onClick(message);
      };

      scope.redraw = function () {
        svg.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')');
      };

      scope.render = function (data) {

        //console.log(data);

        if (scope.force.stop !== undefined) {
          scope.force.stop();
        }

        // clear all elements
        svg.selectAll('*').remove();

        if (!data) {
          return;
        }

        var zoom = d3.behavior.zoom()
                    .duration(150)
                    .scaleExtent([0.1,2.0])
                    .on("zoom", scope.redraw)
        svg.call(zoom)
            .on("mousedown.zoom", null); // deactivate panning

        scope.maxValue = 0;

        for (var i = 0; i < data.nodes.length; i++) {
          if (data.nodes[i].value > scope.maxValue) {
            scope.maxValue = data.nodes[i].value;
          }
        }

        var nodes = data.nodes.slice();
        var links = [];
        var bilinks = [];

        data.properties.forEach(function (link) {
          var s = data.nodes[link.source];
          var i = data.nodes[link.intermediate];
          var t = data.nodes[link.target];

          if (s !== undefined && i !== undefined && t !== undefined) {
            // get direct class links
            if (s.type === 'class' && t.type === 'class') {

              i.value = link.value;

              // create two links
              links.push({source: s, target: i });
              links.push({source: i, target: t });
              bilinks.push({source: s, intermediate: i, target: t, value: link.value});
            }
          }
        });

        // set up dimensions
        var width = d3.select(element[0]).node().offsetWidth - margin;

        scope.force = d3.layout.force()
          .charge(-800)
          .linkDistance(linkDistance)
          .gravity(0.05)
          .size([width, height]);

        svg.attr('width', width - 50)
          .attr('height', height - 50);

        nodes.forEach(function (node) {
          node.radius = scope.calcRadius(node);
        });

        scope.force.nodes(nodes)
          .links(links)
          .start();

        var linkContainer = svg.append('g')
                              .attr('class', 'linkContainer');

        // create the arrow heads
        linkContainer.append("defs").selectAll("marker")
            .data(scope.getArrowHeads())
          .enter().append("marker")
            .attr("id", function(d) { return d.id; })
            .attr("class", function (d) { return d.class; })
            .attr("viewBox", function (d) {return "0 " + (d.size * (-1)) + " " + (d.size * 2) + " " + (d.size * 2); })
            .attr("refX", function(d) { return d.size * 2; })
            .attr("refY", 0)
            .attr("markerWidth", function (d) { return d.size; })
            .attr("markerHeight", function (d) { return d.size; })
            .attr("orient", "auto")
          .append("path")
            .attr("d", function (d) { return "M0," + (d.size * -1) + "L" + (d.size * 2) + ",0L0," + d.size; });

        var link = linkContainer.selectAll(".link")
            .data(bilinks)
           .enter()
            .append("g")
            .attr("class", "link")
            .append("path")
            .attr("class", "link-line")
            .attr("marker-end", function(d) { return scope.getMarkerEnd(false, d.value); })
            .style("stroke-width", function (d) {
                return Math.min(Math.log2(d.value + 2), 5);
            })
            .on('mouseover', function () {
              d3.select(this).attr("marker-end", function (d) { return scope.getMarkerEnd(true, d.value); });
            })
            .on("mouseout", function () {
              d3.select(this).attr("marker-end", function (d) { return scope.getMarkerEnd(false, d.value); });
            });

        var typesContainer = svg.append('g')
                              .attr('class', 'typeContainer');

        var type = typesContainer.selectAll('.type')
                      .data(nodes)
                    .enter().append('g')
                    .filter(function (d) { return d.type === 'type'; })
                      .attr('class', 'type')
                    .call(scope.force.drag);

        var nodeContainer = svg.append('g')
                              .attr('class', 'nodeContainer');

        var node = nodeContainer.selectAll('.node')
                      .data(nodes)
                    .enter().append('g')
                    .classed('node', true)
                    .classed('class', function (d) {return d.type === 'class';})
                    .classed('property', function (d) {return d.type === 'property';})
                    .classed('active', function(d) {return d.uri === data.selected;})
                    .classed('activeIndex', function (d) {return d.index === data.selectedIndex; })
                    .call(scope.force.drag);

        var cardinalSpline = d3.svg.line()
                              .x(function (d) { return d.x; })
                              .y(function(d) { return d.y; })
                              .interpolate("cardinal");

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
            .on('mouseover', function (d) {
              //console.log(d);
            });

        // for classes and properties
        node.append('text')
              .attr('class', 'text')
              .attr('dy', '.35em')
              .attr('text-anchor', 'middle')
              .text(function(d) {
                return scope.getName(d, (d.type === 'property'));
              });

        type.append('rect')
              .attr('x', '-30')
              .attr('y', '-10')
              .attr('width', '60')
              .attr('height', '20')
              .style('fill', '#FC3');

        type.append('text')
              .attr('class', 'text')
              .attr('text-anchor', 'middle')
              .text(function (d) {
                return scope.getName(d, false);
              });

        scope.force.on('tick', function() {

          link.attr('d', function(d) {
            var deltaX = d.target.x - d.intermediate.x;
            var deltaY = d.target.y - d.intermediate.y;

            // Pythagoras rule
            var totalLength = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

            var radius = d.target.radius;

            var offsetX = (deltaX * (radius)) / totalLength;
            var offsetY = (deltaY * (radius)) / totalLength;

            var lineData = [];
            lineData.push({x: d.source.x, y: d.source.y});
            lineData.push({x: d.intermediate.x, y: d.intermediate.y});
            lineData.push({x: (d.target.x - offsetX), y: (d.target.y - offsetY)});

            return cardinalSpline(lineData);
          });

          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          type.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        });
      };
    }
  };
};
