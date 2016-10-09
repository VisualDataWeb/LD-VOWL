/**
 * @ngdoc service
 * @name Links
 *
 * @param {Geometry} Geometry
 *
 * @ngInject
 */
function links(Geometry) {

  const self = this;

  // TODO save values for each endpoint
  self.dtPropDistance = 50;
  self.propDistance = 100;

  self.disjointPropDistance = 100;
  self.loopDistance = 80;

  self.getClassToDatatyoeDistance = function () {
    return self.dtPropDistance;
  };

  self.setClassToDatatypeDistance = function (newLength) {
    self.dtPropDistance = newLength;
  };

  self.getClassToClassDistance = function () {
    return self.propDistance;
  };

  self.setClassToClassDistance = function(newDistance) {
    self.propDistance = newDistance;
  };

  /**
   * @param {{source, target}} d
   * @returns number
   */
  self.getDistance = function (d) {
    var distance;
    if ((d.target !== undefined && d.target.isLoopNode) || (d.source !== undefined && d.source.isLoopNode)) {

      // loops
      distance = self.loopDistance;
    } else {

      // non-loops
      if (d.type === 'datatypeProperty') {
        distance = self.dtPropDistance;
      } else if (d.type === 'disjointProperty') {
        distance = self.disjointPropDistance;
      } else {
        distance = self.propDistance;
      }

      // add radius to source and target
      if (d.source !== undefined && d.source.radius !== undefined) {
        distance += d.source.radius;
      }
      if (d.target !== undefined && d.target.radius !== undefined) {
        distance += d.target.radius;
      }
    }

    return distance;
  };

  /**
   * @param {{source, intermediate, target}} d
   * @returns {Array}
   */
  self.getLoopData = function (d) {
    const loopData = [];

    // for the loops
    loopData.push(Geometry.getAnotherCircleOutlinePoint(d, -1));
    loopData.push({x: d.intermediate.x, y: d.intermediate.y});

    // loops are always towards classes
    loopData.push(Geometry.getAnotherCircleOutlinePoint(d, 1));

    return loopData;
  };

  /**
   * @param {{source, intermediate, target}} d
   * @returns {Array}
   */
  self.getLineData = function (d) {
    const lineData = [];

    // TODO should also start from circumference
    lineData.push({x: d.source.x, y: d.source.y});
    lineData.push({x: d.intermediate.x, y: d.intermediate.y});

    // position depends on node type
    if (d.target.type === 'class') {
      lineData.push(Geometry.getCircleOutlinePoint(d));
    } else {
      lineData.push(Geometry.getRectOutlinePoint(d));
    }

    return lineData;
  };

}

export default links;
