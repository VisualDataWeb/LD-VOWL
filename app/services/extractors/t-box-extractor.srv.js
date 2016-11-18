/**
 * @ngdoc service
 * @name TBoxExtractor
 *
 * @param $q
 * @param $log
 * @param Data
 * @param {Filters} Filters
 * @param StopWatch
 * @param {Promises} Promises
 * @param {ClassExtractor} ClassExtractor
 * @param {RelationExtractor} RelationExtractor
 * @param TypeExtractor
 *
 * @ngInject
 */
function tBoxExtractor($q, $log, Data, Filters, StopWatch, Promises, ClassExtractor, RelationExtractor,
                         TypeExtractor) {

  const self = this;

  self.classes = [];

  self.startTBoxExtraction = function () {
    StopWatch.start();
    ClassExtractor.requestClasses().then(function extractForClasses(results) {
      if (typeof results === 'string' && results === 'canceled') {
        $log.warn('[TBox Extractor] Cancel further extraction steps!');
        return;
      }

      $log.debug('[TBox Extractor] Now the classes should be loaded!');

      // merge existing and new classes
      if (results.length === 0) {
        $log.debug('[TBox Extractor] No new classes!');
        return;
      } else {
        for (let i = 0; i < results.length; i++) {
          self.classes.push(results[i]);
        }
      }

      var promises = [];
      for (let end = 0; end < self.classes.length; end++) {
        for (let start = 0; start < end; start++) {
          promises.push(RelationExtractor.requestClassEquality(self.classes[start], self.classes[end]));
        }
      }

      // after class equality is checked for all pairs, types and relations can be loaded
      $q.allSettled(promises).then(function extractForRemainingClasses(data) {

        $log.debug('[TBox Extractor] Now all should be settled!');

        // remove merged class for class list to avoid further request for these classes
        for (let i = 0; i < data.length; i++) {
          if (data[i]['state'] === 'fulfilled' && data[i]['value'] !== 'canceled') {
            let indexToRemove = self.classes.indexOf(data[i]['value']);

            if (indexToRemove !== -1) {
              self.classes.splice(indexToRemove, 1);
              $log.debug(`[TBox Extractor] Removed '${data[i]['value']}' from class list.`);
            } else {
              $log.error(`[TBox Extractor] Unable to remove '${data[i]['value']}' from class list, ` +
                          `class doesn't exist!`);
            }
          }
        }

        // optionally extract types referring to instances of the classes
        if (Filters.getIncludeLiterals()) {
          self.extractDataTypes();
        }

        self.extractRelations();
      }); // end of $q.allSettled.then()
    });
  };

  /**
   * Load referring types for each class.
   */
  self.extractDataTypes = function () {
    $log.debug(`[TBox Extractor] Loading referring data types for ${self.classes.length} classes...`);

    self.classes.forEach(function (clazz) {
      TypeExtractor.requestReferringTypes(clazz);
    });
  };

  /**
   * Load relations for each pair of classes.
   */
  self.extractRelations = function () {

    $log.debug('[TBox Extractor] Send requests for relations...');

    // for each pair of classes search relation and check equality
    for (let end = 0; end < self.classes.length; end++) {
      for (let start = 0; start < self.classes.length; start++) {
        if (Filters.getIncludeLoops() || start !== end) {
          let origin = self.classes[start];
          let target = self.classes[end];

          RelationExtractor.requestClassClassRelation(origin, target, 10, 0);
        }
      }
    }
  };

  /**
   * Load loop relations, this means class-class relation from one class to itself.
   */
  self.extractRelationLoops = function () {
    self.classes.forEach(function (clazz) {
      if (clazz.class !== undefined && clazz.class.hasOwnProperty('value')) {
        RelationExtractor.requestClassClassRelation(clazz.class.value, clazz);
      }
    });
  };

  /**
   * Stop the running extraction.
   */
  self.stopTBoxExtraction = function () {
    Promises.rejectAll();
    StopWatch.stop();
  };

  /**
   * Restart the extraction.
   */
  self.restartTBoxExtraction = function () {
    Data.clearAll();
    self.classes = [];
    StopWatch.stop();

    $log.warn('[TBox Extractor] Restart TBox extraction...');

    self.startTBoxExtraction();
  };

  self.clearClasses = function () {
    self.classes.length = 0;
  };

}

export default tBoxExtractor;
