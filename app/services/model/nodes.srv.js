'use strict';

nodesService.$inject =['$log', 'Properties', 'Prefixes'];

function nodesService($log, Properties, Prefixes) {

  var classUriIdMap = new Map();
  var nodes = new Map();
  let equivalentClasses = new Map();

  var subClassSet = new Set();

  /* jshint validthis: true */
  var that = this;

  that.DISJOINT_NODE_URI = 'http://my-own-disjoint-node';

  that.suffixRegEx = /(#?[^\/#]*)\/?$/;

  that.initMap = function () {
    if (sessionStorage !== undefined) {
      var sessionNodes = sessionStorage.getItem('nodes');

      if (sessionNodes !== undefined && sessionNodes !== null) {
        $log.debug('[Nodes] Use nodes from session storage!');
        nodes = new Map(JSON.parse(sessionNodes));

        // rebuild the class uri map
        for (var node of nodes.values()) {
          if (node.type === 'class' || node.type === 'disjointNode') {
            classUriIdMap.set(node.uri, node.id);
          } else if (node.type === 'subClassProperty') {
            subClassSet.add(node.childId + node.parentId);
          } else if (node.hasEquivalent === true && node.equivalentURIs !== undefined) {
            for (let i = 0; i < node.equivalentURIs.length; i++) {
              equivalentClasses.set(node.equivalentURIs[i], node.id);
            }
          }
        }

        $log.debug('[Nodes] Build prefix map for nodes from session storage!');
        that.buildPrefixMap();
      }
    } else {
      $log.error('[Nodes] No Session Storage, caching disabled!');
    }
  };

  that.buildPrefixMap = function () {
    Prefixes.clear();

    for (var node of nodes.values()) {
      if (node.uri !== undefined && node.uri.length > 0 &&
          (node.uri !== Properties.SUBCLASS_URI && node.uri !== that.DISJOINT_NODE_URI)) {
        var pre = node.uri.replace(that.suffixRegEx, '');
        Prefixes.addPrefix({'prefix': pre});
      }
    }
  };

  that.updateSessionStorage = function () {
    sessionStorage.setItem('nodes', JSON.stringify([...nodes]));
  };

  /**
   * Add a new node to the graph.
   *
   * @param newNode - the node which should be added to the graph
   */
  that.addNode = function (newNode) {
    let newId = '';
    if (typeof newNode === 'object' && newNode.hasOwnProperty('uri') && newNode.hasOwnProperty('type')) {
      if (newNode.type === 'class') {
        var idByUri = classUriIdMap.get(newNode.uri);

        // check whether this class already exists
        if (idByUri !== undefined) {
          return idByUri;
        } else {
          newId = newNode.type + nodes.size;
          newNode.id = newId;
          nodes.set(newId, newNode);
          classUriIdMap.set(newNode.uri, newId);

          if (newNode.uri !== that.DISJOINT_NODE_URI) {
            var pre = newNode.uri.replace(that.suffixRegEx, '');
            $log.debug(`[Nodes] Prefix for new node is '${pre}'!`);
            Prefixes.addPrefix({'prefix': pre});
          }
        }
      } else if(newNode.type === 'subClassProperty') {
        if (newNode.parentId !== undefined && newNode.childId !== undefined)  {
          const combination = newNode.childId + newNode.parentId ;

          if (!subClassSet.has(combination)) {
            // save this parent-child relation
            subClassSet.add(newNode.childId + newNode.parentId);

            newId = combination;
            newNode.id = newId;
            nodes.set(newId, newNode);
            $log.debug(`[Nodes] Add new Node '${newNode.uri}' with id '${newId}'.`);
          } else {
            $log.warn(`[Nodes] Sub-class rel between ${newNode.childId} & ${newNode.parentId} does already exist!`);
          }
        } else {
          $log.error(`[Nodes] Missing parent child info for subclass relation!`);
        }
      } else {
        newId = newNode.type + nodes.size;
        newNode.id = newId;
        nodes.set(newId, newNode);
        $log.debug(`[Nodes] Add new Node '${newNode.uri}'.`);
      }

      that.updateSessionStorage();
    }
    return newId;
  };

  /**
   * Returns a map with ids as keys and node objects as values.
   *
   * @returns {Map}
   */
  that.getNodes = function () {
    return nodes;
  };

  /**
   * Returns the node with the given id or null if there is none.
   *
   * @param idToSearch - the id of the node to search for
   * @returns {*}
   */
  that.getById = function (idToSearch) {
    var nodeToReturn = null;

    if (idToSearch !== undefined && typeof idToSearch === 'string') {
      nodeToReturn = nodes.get(idToSearch);
    }
    return nodeToReturn;
  };

  /**
   * Returns the number of instances of the node with the given id or -1 if there is no node with the given id.
   *
   * @param id - the id of the node which number of instances should be returned
   * @returns {number}
   */
  that.getInstanceCountById = function (id) {
    var instanceCount = -1;

    var searchedItem = nodes.get(id);

    if (searchedItem !== undefined && searchedItem.hasOwnProperty('value')) {
      instanceCount = searchedItem.value;
    }

    return instanceCount;
  };

  /**
   * Returns the URI of the node with the given id or an empty string if no such node exists.
   *
   * @param id - the id of the node which URI should be returned
   * @returns {string}
   */
  that.getURIById = function (id) {
    var uri = '';

    var searchedItem = nodes.get(id);

    if (searchedItem !== undefined && searchedItem.hasOwnProperty('uri')) {
      uri = searchedItem.uri;
    } else {
      $log.error(`[Nodes] Can not resolve uri of '${id}'! Node doesn't exist!`);
    }

    return uri;
  };

  /**
   * Insert a label for the node with the given id.
   *
   * @param id - the id of the node which should get the label
   * @param label - the label for the node with the given id
   */
  that.insertLabel = function (id, label) {
    var searchedItem = nodes.get(id);

    if (searchedItem !== undefined) {
      searchedItem.name = label;
    } else {
      $log.error(`[Nodes] Can't add label to node with id '${id}', node was not found!`);
    }
  };

  /**
   * Insert a given comment into the node with the also given id.
   *
   * @param id - the id of the node to augment
   * @param commentToAdd - the comment to add to the node with the given id
   */
  that.insertComment = function (id, commentToAdd) {
    var searchedItem = nodes.get(id);

    if (searchedItem !== undefined) {
      searchedItem.comment = commentToAdd;
    } else {
      $log.error(`[Nodes] Unable to add comment '${commentToAdd}' to node with id '${id}'.
        There is no node with this id!`);
    }
  };

  that.setURI = function (id, newUri) {
    var nodeToChange = nodes.get(id);

    if (nodeToChange !== undefined) {
      nodeToChange.uri = newUri;
      that.updateSessionStorage();
    } else {
      $log.error(`[Nodes] Unable to change uri of '${id}' to '${newUri}', there is no node with this id!`);
    }
  };

  /**
   * Set a flag indicating that the types for the class with the given id were loaded.
   *
   * @param classId - the id of the class which referring types were loaded
   */
  that.setTypesLoaded = function (classId) {
    if (classId !== undefined && typeof classId === 'string') {

      var clazz = nodes.get(classId);

      if (clazz !== undefined && clazz.type === 'class') {
        clazz.typesLoaded = true;
      }
    }
  };

  /**
   * Returns true if the types for the class with the given id were already loaded, false otherwise.
   *
   * @param classId - the id of the class to check
   * @returns {boolean}
   */
  that.getTypesLoaded = function (classId) {
    if (classId !== undefined && typeof classId === 'string') {
      var clazz = nodes.get(classId);

      if (clazz !== undefined && clazz.type === 'class' && clazz.typesLoaded) {
        $log.debug(`[Nodes] Types for '${classId}' are already loaded!`);
        return true;
      }
    }
    return false;
  };

  /**
   * Merge two classes with given ids by saving the seconds URI into the first and then deleting the second.
   *
   * @param classId1 - the id of the class to merge into
   * @param classId2 - the id of the class to merge (will be deleted)
   */
  that.mergeClasses = function (classId1, classId2) {
    let deletedId = '';
    if (classId1 !== undefined && typeof classId1 === 'string' && classId2 !== undefined &&
        typeof classId2 === 'string') {

      $log.debug(`[Nodes] Try to merge ${classId1} and ${classId2}...`);

      // NOTE: one or both of them may not exist anymore, because they are already merged with another node

      var cl1 = that.getClassNodeOrEquivalent(classId1);
      var cl2 = that.getClassNodeOrEquivalent(classId2);

      if (cl1 !== undefined && cl1.type === 'class' && cl2 !== undefined && cl2.type === 'class') {
        if (cl1 === cl2) {
          $log.debug('[Nodes] Nothing to do here, classes are already merged!');
        } else {

          // okay classes are not yet equal

          if (!cl1.hasEquivalent) {
            cl1.hasEquivalent = true;
            cl1.equivalentURIs = [];
          }

          if (!cl2.hasEquivalent) {
            // only one uri to copy
            cl1.equivalentURIs.push(cl2.uri);
          } else if (cl2.equivalentURIs !== undefined) {
            // copy all equivalent uris over
            for (let i = 0; i < cl2.equivalentURIs.length; i++) {
              cl1.equivalentURIs.push(cl2.equivalentURIs[i]);
            }
          }

          equivalentClasses.set(classId2, cl1.id);
          nodes.delete(classId2);
          deletedId = classId2;
          $log.debug(`[Nodes] Merged '${cl1.id}' and '${classId2}'.`);
        }
      } else {
        $log.error(`[Nodes] Unable to merge '${classId1}' and '${classId2}'! at least one of them can not be found!`);
      }
    }

    return deletedId;
  };

  that.getClassNodeOrEquivalent = function (classId) {
    let nodeToReturn = nodes.get(classId);

    if (nodeToReturn === undefined) {
      const equivalentId = equivalentClasses.get(classId);
      if (equivalentId !== undefined) {
        nodeToReturn = nodes.get(equivalentId);
      }
    }

    return nodeToReturn;
  };

  that.removeNodes = function (nodeArr) {
    if (nodeArr !== undefined && nodeArr.length > 0) {
      for (let i = 0; i < nodeArr.length; i++) {
        nodes.delete(nodeArr[i]);
      }
    }
  };

  that.incValueOfId = function (id) {
    var searchedItem = nodes.get(id);

    if (searchedItem !== undefined && searchedItem.hasOwnProperty('value')) {
      searchedItem.value += 1;
      return searchedItem.value;
    }
    return -1;
  };

  /**
   * Returns true if there are no nodes, false otherwise.
   *
   * @returns {boolean}
   */
  that.isEmpty = function () {
    return (nodes.size === 0);
  };

  that.hasClassNodes = function () {
    return (classUriIdMap.size > 1);
  };

  /**
   * Removes all nodes from the graph.
   */
  that.clearAll = function () {
    classUriIdMap = new Map();
    nodes = new Map();
    equivalentClasses = new Map();
    Prefixes.clear();
  };

  /**
   * Returns true if an sub class relation between the classes with the given ids does already exist, false otherwise.
   *
   * @param childId - the id of the child class
   * @param parentId - the id of the parent class
   * @returns {boolean}
   */
  that.hasSubClassPropNode = function (childId, parentId) {
    let exists = false;

    if (childId !== undefined && parentId !== undefined) {
      const combination = childId + parentId;
      exists = subClassSet.has(combination);
    } else {
      $log.error('[Nodes] Child or parent id is undefined!');
    }

    return exists;
  };

  that.initMap();

}

export default nodesService;
