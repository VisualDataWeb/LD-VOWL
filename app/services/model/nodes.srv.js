'use strict';

module.exports = function () {

  var classUriIdMap = new Map();

  var nodes = new Map();

  var that = this;

  that.initMap = function () {
    if (sessionStorage !== undefined) {
      var sessionNodes = sessionStorage.getItem('nodes');

      if (sessionNodes !== undefined && sessionNodes !== null) {
        console.log("[Nodes] Use nodes from session storage!");
        nodes = new Map(JSON.parse(sessionNodes));
      }
    } else {
      console.error("[Nodes] No Session Storage, caching disabled!");
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
        console.log("[Nodes] Add new Node '" + newNode.uri +"'.");
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
   * Returns an array with all class URIs.
   *
   * @returns {Array}
   */
  // TODO remove me
  //that.getClassURIs = function () {
  //  var uris = [];
  //
  //  for (var uri of classUriIdMap.keys()) {
  //    uris.push(uri);
  //  }
  //
  //  return uris;
  //};

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
      console.error("[Nodes] Can not resolve uri of '" + id + "'! Node doesn't exist!");
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
      console.error("[Nodes] Can't add label to node with id '" + id + "', node was not found!");
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
      console.error("[Nodes] Unable to add comment '" + commentToAdd + "' to node with id '" + id +
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

  that.mergeClasses = function (classId1, classId2) {
    if (classId1 !== undefined && typeof classId1 === 'string' && classId2 !== undefined &&
        typeof classId2 === 'string') {

      var cl1 = nodes.get(classId1);
      var cl2 = nodes.get(classId2);

      if (cl1 !== undefined && cl1.type === 'class' && cl2 !== undefined && cl2.type === 'class') {
        cl1.equivalentURI = cl2.uri;
        nodes.delete(classId2);
        console.log("[Nodes] Merged '" + classId1 + "' and '" + classId2 + "'.");
      } else {
        console.error("[Nodes] Unable to merge '" + classId1 + "' and '" + classId2 + "!" +
          " at least one of them can not be found!");
      }
    }

    //
    //var index1 = -1;
    //
    //var index2 = -1;
    //for (var i = 0; i < nodes.length; i++) {
    //
    //  var currentNode = nodes[i];
    //  if (currentNode.type === 'class') {
    //    if (currentNode.uri === classURI1) {
    //      index1 = i;
    //    } else if (currentNode.uri === classURI2) {
    //      // skip, everything was found
    //      index2 = i;
    //    }
    //  }
    //
    //  if (index1 !== -1 && index2 !== -1) {
    //    break;
    //  }
    //}
    //
    //if (index1 !== -1 && index2 !== -1) {
    //
    //  // save all information into class1
    //  nodes[index1].equivalentURI = nodes[index2].uri;
    //  // remove element at index2
    //  nodes[index2].hidden = true;
    //}
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
   * Increase the value of the node at the given index.
   *
   * @param index - the index of the node to increase
   * @returns {*} - the new value of the node at the given index
   */
  //that.incValueOfIndex = function () {
  //  nodes[index].value += 1;
  //  return nodes[index].value;
  //};

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
