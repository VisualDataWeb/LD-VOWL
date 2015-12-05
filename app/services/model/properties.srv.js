'use strict';

module.exports = function () {

  this.properties = [];

  this.existsBetween = function (source, target) {
    for (var i = 0; i < this.properties.length; i++) {
      var currentProp = this.properties[i];

      if (currentProp.source === source && currentProp.target === target) {
        return currentProp.uri;
      }
    }
    return false;
  };

  this.addProperty = function (source, intermediate, target, uri) {
    if (typeof source === 'number' && typeof target === 'number') {

      // only add it, if it doesn't already exist
      if (!this.existsBetween(source, target)) {
        var newProperty = {};

        newProperty.source = source;
        newProperty.intermediate = intermediate;
        newProperty.target = target;
        newProperty.value = 1;
        newProperty.props = [];
        newProperty.props.push({'uri': uri});
        newProperty.uri = uri;
        newProperty.type = "property";

        this.properties.push(newProperty);
      } else {
        this.addURI(source, target, uri);
      }
    }
  };

  this.getProperties = function () {
    return this.properties;
  };

  /**
   * Returns the property with the given URI or null, if no property with the given URI exists.
   *
   * @param uriToSearchFor - the URI of the property to be caught
   * @returns {*}
   */
  this.getByURI = function (uriToSearchFor) {
    var prop = null;
    for (var i=0; i<this.properties.length; i++) {
      var currentProp = this.properties[i];
      if (currentProp.uri === uriToSearchFor) {
        prop = currentProp;
        break;
      }
    }
    return prop;
  };

  /**
   * Returns the index of the node between the given nodes.
   *
   * @param source - the index of the source node
   * @param target - the index of the target node
   * @returns {number}
   */
  this.getIntermediateIndex = function (source, target) {
    var intermediateIndex = -1;
    for (var i=0; i<this.properties.length; i++) {
      var currentProp = this.properties[i];
      if (currentProp.source === source && currentProp.target === target) {
        intermediateIndex = currentProp.intermediate;
        break;
      }
    }
    return intermediateIndex;
  };

  this.clearAll = function () {
    this.properties = [];
  };

  this.addURI = function (sourceIndex, targetIndex, uriToAdd) {
    var index = -1;
    for (var i = 0; i < this.properties.length; i++) {
      var currentProperty = this.properties[i];
      if (currentProperty.source === sourceIndex && currentProperty.target === targetIndex) {
        index = i;
        break;
      }
    }

    if (index > -1) {
      var currentProp = this.properties[index];

      // search for new uri is already in there
      var exists = false;
      for (var j = 0; j < currentProp.props.length; j++) {
        if (currentProp.props[j].uri === uriToAdd) {
          exists = true;
          break;
        }
      }

      // uri to add doesn't exist, so it can be added
      if (!exists) {
        var p = {uri: uriToAdd};
        this.properties[index].props.push(p);
        this.properties[index].value++;
      }
    }

  };

  this.insertValue = function (uri, key, value) {
    var index = -1;
    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].uri === uri) {
        index = i;
        break;
      }
    }

    if (index > -1 && index < this.properties.length) {
      this.properties[index][key] = value;
    } else {
      console.error("[Properties] There is no property at index " + index + "!");
    }
  };
};
