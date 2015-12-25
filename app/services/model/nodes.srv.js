'use strict';

module.exports = function ($log) {

  var classUriIdMap = new Map();

  var nodes = new Map();

  var that = this;

  that.initMap = function () {
    if (sessionStorage !== undefined) {
      var sessionNodes = sessionStorage.getItem('nodes');

      if (sessionNodes !== undefined && sessionNodes !== null) {
        $log.debug("[Nodes] Use nodes from session storage!");
        nodes = new Map(JSON.parse(sessionNodes));
      }
    } else {
      $log.error("[Nodes] No Session Storage, caching disabled!");
    }
  };

  that.updateSessionStorage = function () {
    sessionStorage.setItem("nodes", JSON.stringify([...nodes]));
  };

  /**
   * Add a new node to the graph.
   *
   * @param newNode - the node which should be added to the graph
   */
  that.addNode = function (newNode) {
    var newId = "";
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
        }

      } else {
        newId = newNode.type + nodes.size;
        newNode.id = newId;
        nodes.set(newId, newNode);
        $log.debug("[Nodes] Add new Node '" + newNode.uri +"'.");
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
    var uri = "";

    var searchedItem = nodes.get(id);

    if (searchedItem !== undefined && searchedItem.hasOwnProperty('uri')) {
      uri = searchedItem.uri;
    } else {
      $log.error("[Nodes] Can not resolve uri of '" + id + "'! Node doesn't exist!");
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
      $log.error("[Nodes] Can't add label to node with id '" + id + "', node was not found!");
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
      $log.error("[Nodes] Unable to add comment '" + commentToAdd + "' to node with id '" + id +
        "'. There is no node with this id!");
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

      if (clazz.type === "class") {
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
    if (classId !== undefined && typeof  classId === 'string') {
      var clazz = nodes.get(classId);
      if (clazz.type === "class" && clazz.typesLoaded === true) {
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
    if (classId1 !== undefined && typeof classId1 === 'string' && classId2 !== undefined &&
        typeof classId2 === 'string') {

      var cl1 = nodes.get(classId1);
      var cl2 = nodes.get(classId2);

      if (cl1 !== undefined && cl1.type === 'class' && cl2 !== undefined && cl2.type === 'class') {
        cl1.equivalentURI = cl2.uri;
        nodes.delete(classId2);
        $log.debug("[Nodes] Merged '" + classId1 + "' and '" + classId2 + "'.");
      } else {
        $log.error("[Nodes] Unable to merge '" + classId1 + "' and '" + classId2 + "!" +
          " at least one of them can not be found!");
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

  /**
   * Removes all nodes from the graph.
   */
  that.clearAll = function () {
    classUriIdMap = new Map();
    nodes = new Map();
  };

  that.initMap();

};
