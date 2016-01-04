'use strict';

module.exports = function ($rootScope) {

  var prefixes = new Map();

  var that = this;

  that.addPrefix = function (pre) {
    var newNumber = 1;

    if (prefixes.has(pre)) {
      newNumber += prefixes.get(pre);
    }

    prefixes.set(pre, newNumber);

    console.log("[Prefixes] Changed!");
    $rootScope.$broadcast('prefixes-changed', prefixes.size);
  };

  that.clear = function () {
    prefixes = new Map();
    $rootScope.$broadcast('prefixes-changed', 0);
  };

  that.getPrefixes = function () {
    var pres = [];

    for (var [p, v] of prefixes.entries()) {
      pres.push({"prefix": p, "value": v});
    }

    return pres.sort(function(a, b) {
      if (a.value < b.value) {
        return 1;
      } else if (a.value > b.value) {
        return -1;
      } else {
        return 0;
      }
    });
  };

};
