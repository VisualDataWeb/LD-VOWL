'use strict';

module.exports = function ($interval) {

  var self = this;

  self.properties = [];
  self.needsUpdate = false;
  self.updateInterval = 10000;
  self.sessionStorageUpdate = undefined;
  self.unusedRounds = 0;

  /**
   * Initializes properties with the ones saved in the SessionStorage.
   */
  self.initProperties = function () {
    if (sessionStorage !== undefined) {
      var sessionProperties = sessionStorage.getItem("properties");

      if (sessionProperties !== undefined && sessionProperties !== null) {
        var savedItems = JSON.parse(sessionProperties);

        if (savedItems !== undefined && savedItems.length > 0) {
          console.log("[Properties] Re-use " + savedItems.length + " properties from session storage!");
          self.properties = savedItems;
        }
      }
      self.startSessionStorageUpdate();
    } else {
      console.error("[Properties] SessionStorage is not available! Properties will not be saved across page reloads!");
    }
  };

  /**
   * Start to update the HTML5 SessionStore at a regular basis.
   */
  self.startSessionStorageUpdate = function () {

    console.log("[Properties] Start Session Store upgrade!");
    if (self.sessionStorageUpdate !== undefined) {
      return;
    }

    self.sessionStorageUpdate = $interval(function() {
      if (self.needsUpdate) {
        self.updateSessionStorage();
        self.needsUpdate = false;
      } else {
        console.log("[Properties] No SessionStorage update needed!");
        self.unusedRounds++;
        if (self.unusedRounds >= 2) {
          self.endSessionStorageUpdate();
        }
      }
    }, self.updateInterval);
  };

  /**
   * Stops session storage update from being re-executed.
   */
  self.endSessionStorageUpdate = function () {
    if (self.sessionStorageUpdate !== undefined) {
      console.log("[Properties] End SessionStorage update.");
      $interval.cancel(self.sessionStorageUpdate);
      self.sessionStorageUpdate = undefined;
      self.unusedRounds = 0;
    }
  };

  /**
   * Function which is triggered to update properties in HTML5 SessionStore.
   */
  self.updateSessionStorage = function () {
    console.log("[Properties] Update SessionStorage!");
    sessionStorage.setItem("properties", JSON.stringify(self.properties));
  };

  self.existsBetween = function (sourceId, targetId) {

    if (sourceId !== undefined && typeof sourceId === 'string' && targetId !== undefined &&
        typeof targetId === 'string') {

      for (var i = 0; i < self.properties.length; i++) {
        var currentProp = self.properties[i];

        if (currentProp.source === sourceId && currentProp.target === targetId) {
          return currentProp.uri;
        }
      }

    }

    return false;
  };

  self.addProperty = function (source, intermediate, target, uri) {
    if (typeof source === 'string' && typeof intermediate === 'string' && typeof target === 'string') {

      // only add it, if it doesn't already exist
      if (!self.existsBetween(source, target)) {
        var newProperty = {};

        newProperty.source = source;
        newProperty.intermediate = intermediate;
        newProperty.target = target;
        newProperty.value = 1;
        newProperty.props = [];
        newProperty.props.push({'uri': uri});
        newProperty.uri = uri;
        newProperty.type = "property";

        self.properties.push(newProperty);
      } else {
        self.addURI(source, target, uri);
      }
      self.needsUpdate = true;
    }
  };

  self.getProperties = function () {
    return self.properties;
  };

  /**
   * Returns the property with the given URI or null, if no property with the given URI exists.
   *
   * @param uriToSearchFor - the URI of the property to be caught
   * @returns {*}
   */
  self.getByURI = function (uriToSearchFor) {
    var prop = null;
    for (var i=0; i<self.properties.length; i++) {
      var currentProp = self.properties[i];
      if (currentProp.uri === uriToSearchFor) {
        prop = currentProp;
        break;
      }
    }
    return prop;
  };

  self.getByNodeIndex = function (intermediateNodeIndex) {
    var p = null;
    for (var i=0; i < self.properties.length; i++) {
      var currentProp = self.properties[i];
      if (currentProp.intermediate === intermediateNodeIndex) {
        p = currentProp;
        break;
      }
    }
    return p;
  };

  /**
   * Returns the id of the node between two given nodes.
   *
   * @param sourceId - the id of the source node
   * @param targetId - the id of the target node
   * @returns {string}
   */
  self.getIntermediateIndex = function (sourceId, targetId) {
    var intermediateId = "";
    for (var i = 0; i<self.properties.length; i++) {
      var currentProp = self.properties[i];
      if (currentProp.source === sourceId && currentProp.target === targetId) {
        intermediateId = currentProp.intermediate;
        break;
      }
    }
    return intermediateId;
  };

  self.clearAll = function () {
    self.properties = [];
    self.updateSessionStorage();
  };

  self.addURI = function (sourceIndex, targetIndex, uriToAdd) {
    var index = -1;
    for (var i = 0; i < self.properties.length; i++) {
      var currentProperty = self.properties[i];
      if (currentProperty.source === sourceIndex && currentProperty.target === targetIndex) {
        index = i;
        break;
      }
    }

    if (index > -1) {
      var currentProp = self.properties[index];

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
        self.properties[index].props.push(p);
        self.properties[index].value++;
      }
    }
  };

  self.insertValue = function (uri, key, value) {
    var index = -1;
    for (var i = 0; i < self.properties.length; i++) {
      if (self.properties[i].uri === uri) {
        index = i;
        break;
      }
    }

    if (index > -1 && index < self.properties.length) {
      self.properties[index][key] = value;
      self.needsUpdate = true;
    } else {
      console.error("[Properties] " + uri + " was not found!");
      console.error("[Properties] There is no property at index " + index + "!");
    }
  };

  self.mergePropertiesBetween = function (classId1, classId2) {
    for (var i = 0; i < self.properties.length; i++) {
      var currentProp = self.properties[i];

      if (currentProp.source === classId2) {
        currentProp.source = classId1;
      }

      if (currentProp.target === classId2) {
        currentProp.target = classId1;
      }
    }
  };

  self.initProperties();

};
