'use strict';

module.exports = function ($rootScope) {

  var prefixes = new Map();

  var that = this;

  /**
   * Add a new prefix.
   *
   * @param pre - an object with the prefix to add
   */
  that.addPrefix = function (pre) {
    if (typeof pre === 'object' && pre.prefix !== undefined) {

      if (pre.prefix.length < 8) {
        console.error('[Prefixes] Prefix is to short!');
        return;
      }

      var newNumber = 1;

      if (prefixes.has(pre.prefix)) {
        var oldPre = prefixes.get(pre.prefix);
        newNumber += oldPre.value;
      }

      pre.value = newNumber;

      prefixes.set(pre.prefix, pre);

      $rootScope.$broadcast('prefixes-changed', prefixes.size);
    }
  };

  /**
   * Removes all prefixes.
   */
  that.clear = function () {
    prefixes = new Map();
    $rootScope.$broadcast('prefixes-changed', 0);
  };

  /**
   * Returns a sorted array with all namespace prefixes, their class count and classification.
   *
   * @returns {Array}
   */
  that.getPrefixes = function () {
    var pres = [];

    for (var pre of prefixes.values()) {
      pres.push(pre);
    }

    // sort the array
    pres.sort(function(a, b) {
      // compare prefixes according to their value
      if (a.value < b.value) {
        return 1;
      } else if (a.value > b.value) {
        return -1;
      } else {
        return 0;
      }
    });

    // by default, the first one is intern
    if (pres.length > 0 && pres[0].classification === undefined) {
      pres[0].classification = 'intern';
    }

    return pres;
  };

  /**
   * Update prefixes to the given ones.
   *
   * @param newPrefixes - array of the new prefixes
   */
  that.setPrefixes = function (newPrefixes) {
    prefixes = new Map();

    for (var i = 0; i < newPrefixes.length; i++) {
      prefixes.set(newPrefixes[i].prefix, newPrefixes[i]);
    }

    $rootScope.$broadcast('prefixes-changed', prefixes.size);
  };

}; // end of module exports
