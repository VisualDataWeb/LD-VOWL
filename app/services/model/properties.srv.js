'use strict';

properties.$inject = ['$interval', '$log', '$rootScope', 'RequestConfig'];

function properties($interval, $log, $rootScope, RequestConfig) {

  /* jshint validthis: true */
  var self = this;

  self.SUBCLASS_URI = 'http://my-own-sub-class';
  self.DISJOINT_PROP_URI = 'http://my-own-disjoint-prop';
  self.PLACEHOLDER_PROP_URI = 'http://my-placeholder-prop/unknown';

  // jshint ignore:start
  self.useSessionStorage = (__aerobatic__.settings.useSessionStorage === 'true'); // eslint-disable-line no-undef
  // jshint ignore:end

  self.properties = [];
  self.needsUpdate = false;
  self.updateInterval = 5000;
  self.storageUpdate = undefined;
  self.unusedRounds = 0;

  /**
   * Initializes properties with the ones saved in Local- or SessionStorage.
   */
  self.initProperties = function () {
    let storage = (self.useSessionStorage) ? sessionStorage : localStorage ;
    if (storage !== undefined) {
      var sessionProperties = storage.getItem(RequestConfig.getEndpointURL() + '_properties');

      if (sessionProperties !== undefined && sessionProperties !== null) {
        var savedItems = JSON.parse(sessionProperties);

        if (savedItems !== undefined && savedItems.length > 0) {
          $log.debug('[Properties] Re-use ' + savedItems.length + ' properties from session storage!');
          self.properties = savedItems;
        } else {
          $log.debug('[Properties] No saved properties in session storage!');
        }
      }
      self.startStorageUpdate();
    } else {
      $log.error('[Properties] SessionStorage is not available! Properties will not be saved across page reloads!');
    }
  };

  /**
   * Start to update the HTML5 SessionStore at a regular basis.
   */
  self.startStorageUpdate = function () {
    $log.debug('[Properties] (Re-)Start Session Store update!');
    if (self.storageUpdate !== undefined) {
      return;
    }

    self.storageUpdate = $interval(function() {
      if (self.needsUpdate) {
        self.updateStorage();
        $rootScope.$broadcast('properties-changed', '');
        self.needsUpdate = false;
        self.unusedRounds = 0;
      } else {
        $log.debug('[Properties] No Storage update needed!');
        self.unusedRounds++;
        if (self.unusedRounds > 50) {
          self.endStorageUpdate();
        }
      }
    }, self.updateInterval);
  };

  /**
   * Stops session storage update from being re-executed.
   */
  self.endStorageUpdate = function () {
    if (self.storageUpdate !== undefined) {
      $log.warn('[Properties] End the storage update.');
      $interval.cancel(self.storageUpdate);
      self.storageUpdate = undefined;
      self.unusedRounds = 0;
    }
  };

  /**
   * Function which is triggered to update properties in HTML5 SessionStore.
   */
  self.updateStorage = function () {
    let storage = (self.useSessionStorage) ? sessionStorage : localStorage;

    if (storage !== undefined) {
      $log.debug('[Properties] Update Storage!');
      storage.setItem(RequestConfig.getEndpointURL() + '_properties', JSON.stringify(self.properties));
    } else {
      $log.error('[Properties] Unable to update storage, session or local storage is not supported by your browser!');
    }
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

  self.addProperty = function (source, intermediate, target, uri, value) {
    if (typeof source === 'string' && typeof intermediate === 'string' && typeof target === 'string') {

      var ordered;
      if (value !== undefined) {
        ordered = true;
      } else {
        ordered = false;
        value = 1;
      }

      // only add it, if it doesn't already exist
      if (!self.existsBetween(source, target)) {
        var newProperty = {};

        newProperty.source = source;
        newProperty.intermediate = intermediate;
        newProperty.target = target;
        newProperty.value = 1;
        newProperty.props = [];
        newProperty.props.push({'uri': uri, 'value': value});
        newProperty.uri = uri;
        newProperty.type = 'property';
        newProperty.ordered = ordered;

        self.properties.push(newProperty);
      } else {
        self.addURI(source, target, uri, value);
      }
      self.needsUpdate = true;
    }
  };

  self.addSubClassProperty = function (source, intermediate, target) {
    var newSubClassProp = {};

    newSubClassProp.source = source;
    newSubClassProp.intermediate = intermediate;
    newSubClassProp.target = target;
    newSubClassProp.value = 1;
    newSubClassProp.props = [];
    newSubClassProp.props.push({'uri': self.SUBCLASS_URI});
    newSubClassProp.uri = self.SUBCLASS_URI;
    newSubClassProp.type = 'subClassProperty';

    self.properties.push(newSubClassProp);

    self.needsUpdate = true;
  };

  self.addDisjointProp = function (source, target) {
    if (!self.existsBetween(source, target)) {
      var disjointProp = {};

      disjointProp.source = source;
      disjointProp.target = target;
      disjointProp.value = 1;
      disjointProp.uri = self.DISJOINT_PROP_URI;
      disjointProp.type = 'disjointProperty';

      self.properties.push(disjointProp);

      self.needsUpdate = true;
    }
  };

  self.removeDisjointProperties = function (classId) {
    var i = 0;
    var nodesToRemove = [];

    while (i < self.properties.length) {
      var adjacentProp = self.properties[i];
      if (adjacentProp.source === classId && adjacentProp.type === 'disjointProperty') {
        nodesToRemove.push(adjacentProp.target);
        self.properties.splice(i, 1);
      } else {
        i++;
      }
    }

    i = 0;
    while (i < self.properties.length) {
      var otherProp = self.properties[i];
      if (otherProp.type === 'disjointProperty' && nodesToRemove.indexOf(otherProp.target) !== -1) {
        self.properties.splice(i, 1);
      } else {
        i++;
      }
    }

    return nodesToRemove;
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

  /**
   * Returns the property with the given id as its intermediate node or null if no such property exists.
   *
   * @param intermediateNodeId - the id of the intermediate node
   * @returns {*}
   */
  self.getByNodeId = function (intermediateNodeId) {
    var searchedProperty = null;
    // TODO a better way would be to create a map with intermediate id as keys
    for (var i = 0; i < self.properties.length; i++) {
      var currentProperty = self.properties[i];
      if (currentProperty.intermediate === intermediateNodeId) {
        searchedProperty = currentProperty;
        break;
      }
    }
    return searchedProperty;
  };

  /**
   * Returns the id of the node between two given nodes.
   *
   * @param sourceId - the id of the property source node
   * @param targetId - the id of the property target node
   * @returns {string}
   */
  self.getIntermediateId = function (sourceId, targetId) {
    var intermediateId = '';
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
    self.needsUpdate = true;
    self.startStorageUpdate();
  };

  self.addURI = function (sourceIndex, targetIndex, uriToAdd, value) {
    if (value === undefined) {
      value = 1;
    }

    var index = -1;
    for (var i = 0; i < self.properties.length; i++) {
      var currentProperty = self.properties[i];

      // find property between source and target, which is NOT a subclass property
      if (currentProperty.source === sourceIndex && currentProperty.target === targetIndex &&
          currentProperty.type === 'property') {
        index = i;
        break;
      }
    }

    if (index > -1) {
      var currentProp = self.properties[index];

      if (currentProp.uri === self.PLACEHOLDER_PROP_URI) {

        $log.debug(`[Properties] Remove placeholder of property '${currentProp.uri}'!`);

        // do not add it, replace the placeholder information
        currentProp.uri = uriToAdd;

        currentProp.props = [];
        currentProp.props.push({uri: uriToAdd, value: value});
      } else {

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
          var p = {uri: uriToAdd, value: value};
          self.properties[index].props.push(p);
          self.properties[index].value++;
        }
      }
    }
  };

  self.insertValue = function (uri, key, value) {
    let index = -1;
    for (let i = 0; i < self.properties.length; i++) {
      if (self.properties[i].uri === uri) {
        index = i;
        break;
      }
    }

    if (index > -1 && index < self.properties.length) {
      self.properties[index][key] = value;
      self.needsUpdate = true;
    } else {
      $log.debug(`[Properties] '${uri}' was not found! The value ${value} could not be inserted as ${key}.`);
    }
  };

  self.mergePropertiesBetween = function (classId1, classId2) {
    let nodesToRemove = [];

    let i = 0;
    while (i < self.properties.length) {
      let currentProp = self.properties[i];

      if (currentProp.source === classId2) {
        if (currentProp.type === 'subClassProperty' &&
          self.existsBetween(classId1, currentProp.target) === self.SUBCLASS_URI) {

          $log.debug(`[Properties] Remove node '${currentProp.intermediate}'.`);
          nodesToRemove.push(currentProp.intermediate);
          self.properties.splice(i, 1);
          continue;
        } else {
          currentProp.source = classId1;
        }
      }

      if (currentProp.target === classId2) {
        if (currentProp.type === 'subClassProperty' &&
            self.existsBetween(currentProp.source, classId1) === self.SUBCLASS_URI) {

          $log.debug(`[Properties] Remove node '${currentProp.intermediate}'.`);
          nodesToRemove.push(currentProp.intermediate);
          self.properties.splice(i, 1);
          continue;
        } else {
          currentProp.target = classId1;
        }
      }

      i++;
    }

    self.needsUpdate = true;

    return nodesToRemove;
  }; // end of mergePropertiesBetween()

  self.initProperties();

}

export default properties;
