/**
 * @ngdoc service
 * @name Properties
 *
 * @param {$interval} $interval
 * @param {$log} $log
 * @param {$rootScope} $rootScope
 * @param {RequestConfig} RequestConfig
 *
 * @ngInject
 */
function properties($interval, $log, $rootScope, RequestConfig) {

  const self = this;

  self.SUBCLASS_URI = 'http://my-own-sub-class';
  self.DISJOINT_PROP_URI = 'http://my-own-disjoint-prop';
  self.PLACEHOLDER_PROP_URI = 'http://my-placeholder-prop/unknown';

  self.useSessionStorage = __SESSION_STORAGE__; // eslint-disable-line no-undef

  self.properties = [];

  self.intermediateIdMap = new Map();
  self.sourceTargetPropertyMap = new Map();
  self.sourceTargetSubclassMap = new Map();
  self.sourceTargetDisjointMap = new Map();

  self.needsUpdate = false;
  self.updateInterval = 5000;
  self.storageUpdate = undefined;
  self.unusedRounds = 0;
  
  /**
   * Initializes properties with the ones saved in Local- or SessionStorage.
   */
  self.initProperties = function () {
    let storage = (self.useSessionStorage) ? sessionStorage : localStorage;
    if (storage !== undefined) {
      const sessionProperties = storage.getItem(RequestConfig.getEndpointURL() + '_properties');

      if (sessionProperties !== undefined && sessionProperties !== null) {
        const savedItems = JSON.parse(sessionProperties);

        if (savedItems !== undefined && savedItems.length > 0) {
          $log.debug('[Properties] Re-use ' + savedItems.length + ' properties from session storage!');
          savedItems.forEach(prop => {
            return self.intermediateIdMap.set(prop.intermediate, prop);
          });
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

  /**
   * Returns true if source and target are strings and there is a property between these nodes.
   * @param {string} sourceId - the id of the source node
   * @param {string} targetId - the id of the target node
   * @param {boolean} considerSubclasses - whether sub class property should be considered or not
   * @param {boolean} considerDisjoint - whether disjoint properties should be considered or not
   * @returns {*}
   */
  self.existsBetween = function (sourceId, targetId, considerSubclasses = false, considerDisjoint = false) {
    if (typeof sourceId === 'string' && typeof targetId === 'string') {

      const property = self.sourceTargetPropertyMap.get(`${sourceId} - ${targetId}`);
      if (property !== undefined && property.uri !== undefined) {
        return property.uri;
      }

      if (considerSubclasses) {
        const subClassProperty = self.sourceTargetSubclassMap.get(`${sourceId} - ${targetId}`);
        if (subClassProperty !== undefined && subClassProperty.uri !== undefined) {
          return subClassProperty.uri;
        }
      }

      if (considerDisjoint) {
        const disjointProperty = self.sourceTargetDisjointMap.get(`${sourceId} - ${targetId}`);
        if (disjointProperty !== undefined && disjointProperty.uri !== undefined) {
          return disjointProperty.uri;
        }
      }
    } // end of legal parameters
    return false;
  };

  /**
   * Adds a new property to the array. Parameters source, intermediate, target and uri must be strings.
   *
   * @param {string} source - the id of the source node
   * @param {string} intermediate - the id of the intermediate node
   * @param {string} target - the id of the target node
   * @param {string} uri - the URI of the new property
   * @param {number} value - the value of the new property
   */
  self.addProperty = function (source, intermediate, target, uri, value) {
    if (typeof source === 'string' && typeof intermediate === 'string' && typeof target === 'string' &&
        typeof uri === 'string') {

      let ordered;
      if (value !== undefined) {
        ordered = true;
      } else {
        ordered = false;
        value = 1;
      }

      // only add it, if it doesn't already exist
      if (!self.existsBetween(source, target)) {
        let newProperty = {};

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
        self.intermediateIdMap.set(intermediate, newProperty);
        self.sourceTargetPropertyMap.set(`${source} - ${target}`, newProperty);
      } else {
        self.addURI(source, target, uri, value);
      }
      self.needsUpdate = true;
    } else {
      $log.error(`[Properties] Unable to add new prop '${source}' -> '${intermediate}' ->'${target}' named '${uri}': ` +
                  'Missing information!');
    }
  };

  /**
   * Adds a new sub class property.
   *
   * @param {string} source - the id of the source node
   * @param {string} intermediate - the id of the intermediate node
   * @param {string} target - the id of the target node
   */
  self.addSubClassProperty = function (source, intermediate, target) {
    if (typeof source === 'string' && typeof intermediate === 'string' && typeof target === 'string') {
      const newSubClassProp = {};

      newSubClassProp.source = source;
      newSubClassProp.intermediate = intermediate;
      newSubClassProp.target = target;
      newSubClassProp.value = 1;
      newSubClassProp.props = [];
      newSubClassProp.props.push({'uri': self.SUBCLASS_URI});
      newSubClassProp.uri = self.SUBCLASS_URI;
      newSubClassProp.type = 'subClassProperty';

      self.properties.push(newSubClassProp);
      self.sourceTargetSubclassMap.set(`${source} - ${target}`, newSubClassProp);
      self.intermediateIdMap.set(intermediate, newSubClassProp);

      self.needsUpdate = true;
    } else {
      $log.error(`[Properties] Unable to add sub class prop from '${source}' via '${intermediate}' to '${target}': ` +
                'Missing information!');
    }
  };

  self.addDisjointProp = function (source, target) {
    // sub class and disjoint props are added first, so this must be one of these set relations
    if (!self.existsBetween(source, target, true, true)) {
      const disjointProp = {
        source: source,
        target: target,
        value: 1,
        uri: self.DISJOINT_PROP_URI,
        type: 'disjointProperty'
      };

      self.properties.push(disjointProp);
      self.sourceTargetDisjointMap.set(`${source} - ${target}`, disjointProp);

      self.needsUpdate = true;
    }
  };

  self.removeDisjointProperties = function (classId) {
    let i = 0;
    let nodesToRemove = [];

    while (i < self.properties.length) {
      let adjacentProp = self.properties[i];
      if (adjacentProp.source === classId && adjacentProp.type === 'disjointProperty') {
        nodesToRemove.push(adjacentProp.target);
        self.properties.splice(i, 1);
      } else {
        i++;
      }
    }

    i = 0;
    while (i < self.properties.length) {
      let otherProp = self.properties[i];
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
   * @param {string} uriToSearchFor - the URI of the property to be caught
   * @returns {*}
   */
  self.getByURI = function (uriToSearchFor) {
    let prop = null;
    for (let i = 0; i < self.properties.length; i++) {
      let currentProp = self.properties[i];
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
   * @param {string} intermediateNodeId - the id of the intermediate node
   * @returns {*}
   */
  self.getByNodeId = function (intermediateNodeId) {
    return self.intermediateIdMap.get(intermediateNodeId);
  };

  /**
   * Returns the id of the node between two given nodes.
   *
   * @param {string} sourceId - the id of the property source node
   * @param {string} targetId - the id of the property target node
   * @returns {string}
   */
  self.getIntermediateId = function (sourceId, targetId) {
    let intermediateId = '';
    for (let i = 0; i < self.properties.length; i++) {
      let currentProp = self.properties[i];
      if (currentProp.source === sourceId && currentProp.target === targetId) {
        intermediateId = currentProp.intermediate;
        break;
      }
    }
    return intermediateId;
  };

  self.clearAll = function () {
    self.properties.length = 0;

    // clear maps
    self.intermediateIdMap.clear();
    self.sourceTargetPropertyMap.clear();
    self.sourceTargetSubclassMap.clear();
    self.sourceTargetDisjointMap.clear();

    self.needsUpdate = true;
    self.startStorageUpdate();
  };

  self.addURI = function (sourceIndex, targetIndex, uriToAdd, value = 1) {
    const currentProp = self.sourceTargetPropertyMap.get(`${sourceIndex} - ${targetIndex}`);

    if (currentProp !== undefined) {
      if (currentProp.uri === self.PLACEHOLDER_PROP_URI) {
        $log.debug(`[Properties] Remove placeholder of property '${currentProp.uri}'!`);

        // do not add it, replace the placeholder information
        currentProp.uri = uriToAdd;

        currentProp.props = [];
        currentProp.props.push({uri: uriToAdd, value: value});
      } else {
        const exists = currentProp.props.some(prop => prop.uri === uriToAdd);

        // uri to add doesn't exist, so it can be added
        if (!exists) {
          const p = {uri: uriToAdd, value: value};
          currentProp.props.push(p);
          currentProp.value++;
        }
      }
    } else {
      $log.error(`[Properties] Could not find property between ${sourceIndex} and ${targetIndex}!`);
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
          self.existsBetween(classId1, currentProp.target, true, false) === self.SUBCLASS_URI) {

          $log.debug(`[Properties] Remove node '${currentProp.intermediate}'.`);
          nodesToRemove.push(currentProp.intermediate);
          self.properties.splice(i, 1);
          self.intermediateIdMap.delete(currentProp.intermediate);
          continue;
        } else {
          currentProp.source = classId1;
        }
      }

      if (currentProp.target === classId2) {
        if (currentProp.type === 'subClassProperty' &&
          self.existsBetween(currentProp.source, classId1, true, false) === self.SUBCLASS_URI) {

          $log.debug(`[Properties] Remove node '${currentProp.intermediate}'.`);
          nodesToRemove.push(currentProp.intermediate);
          self.properties.splice(i, 1);
          self.intermediateIdMap.delete(currentProp.intermediate);
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
