'use strict';

module.exports = function ($rootScope) {

  var prefixes = new Map();

  var that = this;

  that.addPrefix = function (pre) {
    if (typeof pre === 'object' && pre.prefix !== undefined) {
      var newNumber = 1;

      if (prefixes.has(pre.prefix)) {
        var oldPre = prefixes.get(pre.prefix);
        newNumber += oldPre.value;
      } else {
        newNumber = newNumber;
      }

      pre.value = newNumber;

      prefixes.set(pre.prefix, pre);

      console.log("[Prefixes] Values have changed!");
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
   * Returns a sorted array with all namespace prefixes, their class count and classification
   * @returns {Array}
   */
  that.getPrefixes = function () {
    var pres = [];

    for (var pre of prefixes.values()) {
      pres.push(pre);
    }

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

    console.log("[Prefixes] Values have changed!");
    $rootScope.$broadcast('prefixes-changed', prefixes.size);
  };

};
