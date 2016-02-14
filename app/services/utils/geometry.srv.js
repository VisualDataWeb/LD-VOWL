'use strict';

Geometry.$inject = ['Utils'];

/**
 * @Name Geometry
 */
class Geometry {

  constructor(utils) {
    this.utils = utils;
    this.defaultPropHeight = 20;
  }

  getCircleOutlinePoint(d) {
    var deltaX = d.target.x - d.intermediate.x;
    var deltaY = d.target.y - d.intermediate.y;

    // Pythagoras rule
    var totalLength = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

    var radius = d.target.radius;
    var offsetX = (deltaX * (radius)) / totalLength;
    var offsetY = (deltaY * (radius)) / totalLength;

    return {x: (d.target.x - offsetX), y: (d.target.y - offsetY)};
  }

  getAnotherCircleOutlinePoint(d, a) {
    var deltaX = (d.intermediate.x - d.source.x);
    var deltaY = (d.intermediate.y - d.source.y);

    // the angle of direct connection towards intermediate node
    var angleToLabel = Math.atan2(deltaY, deltaX);

    // calculate new angle
    var deltaAngle = (a * (Math.PI / 6));
    var angle = angleToLabel + deltaAngle;

    var radius = d.target.radius;

    // calculate coordinates on circumference
    var x = d.target.x + (radius * Math.cos(angle));
    var y = d.target.y + (radius * Math.sin(angle));

    // return the point on the circle circumference
    return {x: x, y: y};
  }

  calcPropBoxWidth(d) {
    return (this.utils.getName(d, true, true).length * 8);
  }

  getRectOutlinePoint(d) {
    var source = (d.intermediate !== undefined) ? d.intermediate : d.source;

    var m = (d.target.y - source.y) / (d.target.x - source.x);

    var boxWidth = this.calcPropBoxWidth(d.target);

    var minX = d.target.x - (boxWidth / 2);
    var maxX = d.target.x + (boxWidth / 2);

    var minY = d.target.y - (this.defaultPropHeight / 2);
    var maxY = d.target.y + (this.defaultPropHeight / 2);

    // left side
    if (source.x < d.target.x) {
      var minXy = m * (minX - source.x) + source.y;
      if (minY < minXy && minXy < maxY) {
        return {x: minX, y: minXy};
      }
    }

    // right side
    if (source.x >= d.target.x) {
      var maxXy = m * (maxX - source.x) + source.y;
      if (minY < maxXy && maxXy < maxY) {
        return {x: maxX, y: maxXy};
      }
    }

    // top side
    if (source.y < d.target.y) {
      var minYx = (minY - source.y) / m + source.x;
      if (minX < minYx && minYx < maxX) {
        return {x: minYx, y: minY};
      }
    }

    // bottom side
    if (source.y >= d.target.y) {
      var maxYx = (maxY - source.y) / m + source.x;
      if (minX < maxYx && maxYx < maxX) {
        return {x: maxYx, y: maxY};
      }
    }
  }

} // end of Geometry class

export default Geometry;
