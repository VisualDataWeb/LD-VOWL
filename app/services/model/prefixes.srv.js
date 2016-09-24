/**
 * @Name Prefixes
 *
 * @param $rootScope
 * @param $log
 */
function prefixesService($rootScope, $log) {

  'ngInject';

  var prefixes = [];
  var colorNumber = 1;
  var differentColors = true;

  /* jshint validthis: true */
  const that = this;

  /**
   * Add a new prefix.
   *
   * @param pre - an object with the prefix to add
   */
  that.addPrefix = function (pre) {
    if (typeof pre === 'object' && pre.prefix !== undefined) {

      if (pre.prefix.length < 8) {
        $log.warn(`[Prefixes] Prefix is too short: '${pre.prefix}'`);
        return;
      }

      var existingPrefix;
      for (let i = 0; i < prefixes.length; i++) {
        prefixes[i].classification = 'extern';
        if (prefixes[i].prefix === pre.prefix) {
          existingPrefix = prefixes[i];
        }
      }

      if (existingPrefix !== undefined) {
        existingPrefix.value++;
      } else {
        pre.color = colorNumber;
        pre.value = 1;
        colorNumber++;
        prefixes.push(pre);
      }

      // sort the array
      prefixes.sort(function(a, b) {
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
      if (prefixes.length > 0) {
        prefixes[0].classification = 'intern';
      }

      $rootScope.$broadcast('prefixes-changed', prefixes.length);
    }
  };

  /**
   * Removes all prefixes.
   */
  that.clear = function () {
    prefixes.length = 0;
    colorNumber = 1;
    $rootScope.$broadcast('prefixes-changed', 0);
  };

  /**
   * Returns a sorted array with all namespace prefixes, their class count and classification.
   *
   * @returns {Array}
   */
  that.getPrefixes = function () {
    return prefixes;
  };

  /**
   * Update prefixes to the given ones.
   *
   * @param newPrefixes - array of the new prefixes
   */
  that.setPrefixes = function (newPrefixes) {
    if (newPrefixes !== undefined && newPrefixes.length !== undefined) {
      prefixes = newPrefixes;

      $rootScope.$broadcast('prefixes-changed', prefixes.length);
    }
  };

  /**
   * Returns true if the given URI is an internal one, false otherwise.
   *
   * @param uri - the URI to be checked
   * @returns {boolean}
   */
  that.isInternal = function (uri) {
    let internal = false;

    for (let i = 0; i < prefixes.length; i++) {
      let pre = prefixes[i];

      if (pre.classification === 'intern' && uri.indexOf(pre.prefix) !== -1) {
        internal = true;
        break;
      }
    }

    return internal;
  };

  /**
   * Returns the color number for a node with the given URI. If different colors are disabled, this will always return 1
   * @param uri - the uri of the node to color
   * @returns {number} the number of the color to use
   */
  that.getColor = function (uri) {
    let colorNumber = 1;

    if (differentColors) {
      for (let i = 0; i < prefixes.length; i++) {
        let pre = prefixes[i];

        if (pre.classification !== 'intern' && uri.indexOf(pre.prefix) !== -1) {
          colorNumber = pre.color;
          break;
        }
      }
    }

    return colorNumber;
  };

  /**
   * Returns true if different colors should be used for external elements, false otherwise
   * @returns {boolean}
   */
  that.getDifferentColors = function () {
    return differentColors;
  };

  /**
   * Toggles the different colors flag broadcasts its modification and returns the new state of the flag.
   * @returns {boolean}
   */
  that.toggleDifferentColors = function () {
    differentColors = !differentColors;
    $rootScope.$broadcast('prefixes-changed', prefixes.length);
    return differentColors;
  };

  /**
   * Returns the number of prefixes
   * @returns {Number}
   */
  that.size = function() {
    return prefixes.length;
  };

} // end of PrefixesService

export default prefixesService;
