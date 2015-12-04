'use strict';

module.exports = function (PREFIX, PROPERTY_BLACKLIST, CLASS_BLACKLIST, RequestConfig, Nodes,
  Properties, Requests, ClassExtractor, RelationExtractor) {

  var vm = this;

  //TODO move default settings into a constant
  vm.currentLanguage = RequestConfig.getLabelLanguage() || 'en';
  vm.currentLimit = RequestConfig.getLimit();

  vm.langPreferences = "en, de";

  vm.propertyBlacklistInput = '';
  vm.classBlacklistInput = '';

  vm.separator = ", \n";

  vm.initialize = function () {
    var classItems = ClassExtractor.getBlacklist();
    var propertyItems = RelationExtractor.getBlacklist();

    vm.classBlacklistInput = classItems.join(vm.separator);
    vm.propertyBlacklistInput = propertyItems.join(vm.separator);
  };

  vm.updateLabelLanguage = function () {
    RequestConfig.setLabelLanguage(vm.currentLanguage);
  };

  /**
   * Save Blacklists for RDFS and OWL.
   */
  vm.save = function () {

    var input = vm.propertyBlacklistInput.replace(/(\r\n|\n|\r|\s)/gm,"");
    var items = input.split(',');

    // update blacklist in extractor
    RelationExtractor.setBlacklist(items);

    // delete all loaded data
    Nodes.clearAll();
    Properties.clearAll();
    Requests.clear();

    RequestConfig.setLimit(vm.currentLimit);
  };

  /**
   * Reset all settings to its default values.
   */
  vm.restoreDefaults = function () {
    var propertyItems = [];
    for (var pVoc in PROPERTY_BLACKLIST) {
      if (PROPERTY_BLACKLIST.hasOwnProperty(pVoc)) {
        for (var i = 0; i < PROPERTY_BLACKLIST[pVoc].length; i++) {
          propertyItems.push(PREFIX[pVoc] + PROPERTY_BLACKLIST[pVoc][i]);
        }
      }
    }
    vm.propertyBlacklistInput = propertyItems.join(vm.separator);

    var classItems = [];
    for (var cVoc in CLASS_BLACKLIST) {
      if (CLASS_BLACKLIST.hasOwnProperty(cVoc)) {
        for (var j = 0; j < CLASS_BLACKLIST[cVoc].length; j++) {
          propertyItems.push(PREFIX[cVoc] + PROPERTY_BLACKLIST[cVoc][j]);
        }
      }
    }
    vm.classBlacklistInput = classItems.join(vm.separator);
  };

  vm.initialize();

};
