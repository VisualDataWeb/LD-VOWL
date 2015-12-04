'use strict';

module.exports = function () {

  this.types = [];

  /**
   * Add a new type to the list of types.
   *
   * @param newType - the new type to be added
   */
  this.addType = function (newType) {
    this.types.push(newType);
  };

  /**
   * Returns true if a type with the given URI already exists, false otherwise.
   *
   * @param typeURI - the uri of the type to be checked
   */
  this.contains = function (typeURI) {
    var found = false;

    for (var i = 0; i < this.types.length; i++) {
      var currentType = this.types[i];
      if (currentType.hasOwnProperty('uri') && currentType.uri === typeURI) {
        found = true;
        break;
      }
    }

    return found;
  };

  /**
   * Returns an array of types.
   */
  this.getTypes = function () {
    return this.types;
  };

};
