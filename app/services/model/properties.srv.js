'use strict';

module.exports = function () {

  this.properties = [];

  this.existsBetween = function (source, target) {
    for (var i = 0; i < this.properties.length; i++) {
      var currentProp = this.properties[i];

      if (currentProp.source === source && currentProp.target === target) {
        return true;
      }
    }
    return false;
  };

  this.addProperty = function (source, target, uri) {
    if (typeof source === 'number' && typeof target === 'number') {

      // only add it, if it doesn't already exist
      if (!this.existsBetween(source, target)) {
        var newProperty = {};

        newProperty.source = source;
        newProperty.target = target;
        newProperty.value = 1;
        newProperty.props = [];
        newProperty.props.push({'uri': uri});
        newProperty.uri = uri;

        this.properties.push(newProperty);
      } else {
        this.addURI(source, target, uri);
      }
    }
  };

  this.getProperties = function () {
    return this.properties;
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
