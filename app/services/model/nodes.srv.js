'use strict';

module.exports = function () {

  // array to save all the nodes
  var nodes = [];

  /**
   * Add a new node to the graph.
   *
   * @param newNode - the node which should be added to the graph
   */
  this.addNode = function (newNode) {
    if (typeof newNode === 'object' && newNode.hasOwnProperty('uri')) {
      // does not already exist
      if (!this.contains(newNode.uri)) {
        nodes.push(newNode);
      }
    }
  };

  /**
   * Returns an array with all nodes in the graph.
   */
  this.getNodes = function () {
    return nodes;
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
   * @param uri - the uri of the node to sarch for
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
  this.insertValue= function (uri, key, value) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].uri === uri) {
        nodes[i][key] = value;
      }
    }
  };

  /**
   * Removes all nodes from the graph.
   */
  this.clearAll = function () {
    nodes = [];
  };

};
