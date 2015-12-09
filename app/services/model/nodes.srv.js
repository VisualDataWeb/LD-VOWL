'use strict';

module.exports = function () {

  /**
   * Array holding all nodes (classes and properties)
   * @type {Array}
   */
  var nodes = [];
  if (sessionStorage !== undefined) {
    var sessionNodes = sessionStorage.getItem("nodes");

    if (sessionNodes !== undefined && sessionNodes !== null) {
      console.log("[Nodes] Use nodes from session storage!");
      nodes = JSON.parse(sessionNodes);
    }
  }

  this.updateSessionStorage = function () {
    sessionStorage.setItem("nodes", JSON.stringify(nodes));
  };

  /**
   * Add a new node to the graph.
   *
   * @param newNode - the node which should be added to the graph
   */
  this.addNode = function (newNode) {
    var index = -2;
    if (typeof newNode === 'object' && newNode.hasOwnProperty('uri')) {
      index = this.getIndexOf(newNode.uri);

      // does not already exist
      if (newNode.type === 'property' || this.getIndexOf(newNode.uri) === -1) {
        newNode.index = nodes.length;
        index = nodes.push(newNode) - 1;
      }
    }

    this.updateSessionStorage();

    return index;
  };

  /**
   * Returns an array with all nodes in the graph.
   */
  this.getNodes = function () {
    return nodes;
  };

  /**
   * Returns the node with the given index or null if this node doesn't exist.
   *
   * @param index - the index of the node to be fetched
   * @returns {*}
   */
  this.getByIndex = function (index) {
    var nodeToReturn = null;
    if (index !== undefined && typeof index === 'number') {
      if (nodes[index] !== undefined) {
        nodeToReturn = nodes[index];
      }
    }
    return nodeToReturn;
  };

  /**
   * Returns true if there is a node with the given uri, false otherwise.
   *
   * @param uri - the uri of the node to check
   */
  this.contains = function (uri) {
    return (this.getIndexOf(uri) !== -1);
  };

  /**
   * Returns the index of the node with the given uri.
   *
   * @param uri - the uri of the node to search for
   */
  this.getIndexOf = function (uri) {
    var index = -1;

    if (typeof uri === 'string') {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].uri === uri) {
          index = i;
          break;
        }
      }
    }
    return index;
  };

  /**
   * Insert a new attribute to an existing node.
   *
   * @param uri - the uri of the node to augment
   * @param key - the name of the attribute to Add
   * @param value - the value of the new attribute
   */
  this.insertValue = function (uri, key, value) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].uri === uri) {
        nodes[i][key] = value;
      }
    }
  };

  /**
   * Increase the value of the node at the given index.
   *
   * @param index - the index of the node to increase
   * @returns {*} - the new value of the node at the given index
   */
  this.incValueOfIndex = function (index) {
    nodes[index].value += 1;
    return nodes[index].value;
  };

  /**
   * Returns true if there are no nodes, false otherwise.
   *
   * @returns {boolean}
   */
  this.isEmpty = function () {
    return (nodes.length < 1);
  };

  /**
   * Removes all nodes from the graph.
   */
  this.clearAll = function () {
    nodes = [];
  };

};
