/**
 * @ngdoc type
 * @name SettingsCtrl
 *
 * @param {$log} $log
 * @param {Storage} Storage
 * @param {PREFIX} PREFIX
 * @param {PROPERTY_BLACKLIST} PROPERTY_BLACKLIST
 * @param {CLASS_BLACKLIST} CLASS_BLACKLIST
 * @param {RequestConfig} RequestConfig
 * @param {Data} Data
 * @param {ClassExtractor} ClassExtractor
 * @param {RelationExtractor} RelationExtractor
 *
 * @ngInject
 */
function settingsCtrl($log, Storage, PREFIX, PROPERTY_BLACKLIST, CLASS_BLACKLIST, RequestConfig, Data, ClassExtractor,
                      RelationExtractor) {

  const vm = this;

  //TODO move default settings into a constant
  vm.currentLanguage = RequestConfig.getLabelLanguage() || 'en';
  vm.currentLimit = RequestConfig.getLimit();

  vm.availableLanguages = [
    {id: 'en', name: 'English'},
    {id: 'de', name: 'German'}
  ];

  vm.propsOrdered = true;

  vm.propertyBlacklistInput = '';
  vm.classBlacklistInput = '';

  vm.separator = ', \n';

  vm.enabled = [];

  vm.initialize = function () {
    const classItems = ClassExtractor.getBlacklist();
    const propertyItems = RelationExtractor.getBlacklist();

    vm.propsOrdered = RequestConfig.getPropertiesOrdered();

    let savedFlags = [];
    savedFlags['RDF'] = Storage.getItem('blacklist_rdf');
    savedFlags['RDFS'] = Storage.getItem('blacklist_rdfs');
    savedFlags['OWL'] = Storage.getItem('blacklist_owl');
    savedFlags['SKOS'] = Storage.getItem('blacklist_skos');

    if (savedFlags['RDF'] !== undefined && savedFlags['RDF'] !== null) {
      vm.enabled['RDF'] = savedFlags['RDF'] === 'true';
    } else {
      vm.enabled['RDF'] = true;
    }

    if (savedFlags['RDFS'] !== undefined && savedFlags['RDFS'] !== null) {
      vm.enabled['RDFS'] = savedFlags['RDFS'] === 'true';
    } else {
      vm.enabled['RDFS'] = true;
    }

    if (savedFlags['OWL'] !== undefined && savedFlags['OWL'] !== null) {
      vm.enabled['OWL'] = savedFlags['OWL'] === 'true';
    } else {
      vm.enabled['OWL'] = true;
    }

    if (savedFlags['SKOS'] !== undefined && savedFlags['SKOS'] !== null) {
      vm.enabled['SKOS'] = savedFlags['SKOS'] === 'true';
    } else {
      vm.enabled['SKOS'] = false;
    }

    vm.classBlacklistInput = classItems.join(vm.separator);
    vm.propertyBlacklistInput = propertyItems.join(vm.separator);
  };

  vm.updateLabelLanguage = function () {
    RequestConfig.setLabelLanguage(vm.currentLanguage);
    $log.debug(`[Settings] Changed label language to "${vm.currentLanguage}".`);
  };

  vm.updatePropsOrdered = function () {
    RequestConfig.setPropertiesOrdered(vm.propsOrdered);
  };

  vm.updateList = function () {
    vm.restoreDefaults();
    vm.save();
  };

  /**
   * Save Blacklists for RDFS and OWL.
   */
  vm.saveExtractionSettings = function () {
    vm.updateLabelLanguage();
    vm.updatePropsOrdered();
    RequestConfig.setLimit(vm.currentLimit);
  };
  
  vm.saveBlacklists = function () {
    const input = vm.propertyBlacklistInput.replace(/(\r\n|\n|\r|\s)/gm, '');
    const items = input.split(',');

    // update blacklist in extractor
    RelationExtractor.setBlacklist(items);

    const classInput = vm.classBlacklistInput.replace(/(\r\n|\n|\r|\s)/gm, '');
    const classItems = classInput.split(',');
    ClassExtractor.setBlacklist(classItems);

    // delete all loaded data
    Data.clearAll();

    const rdfState = (vm.enabled['RDF']) ? 'true' : 'false';
    const rdfsState = (vm.enabled['RDFS']) ? 'true' : 'false';
    const owlState = (vm.enabled['OWL']) ? 'true' : 'false';
    const skosState = (vm.enabled['SKOS']) ? 'true' : 'false';

    Storage.setItem('blacklist_rdf', rdfState);
    Storage.setItem('blacklist_rdfs', rdfsState);
    Storage.setItem('blacklist_owl', owlState);
    Storage.setItem('blacklist_skos', skosState);

    // save inputs
    Storage.setItem('class_blacklist', vm.classBlacklistInput);
    Storage.setItem('property_blacklist', vm.propertyBlacklistInput);
  };

  /**
   * Reset all settings to its default values.
   */
  vm.restoreDefaults = function () {
    vm.enabled['RDF'] = true;
    vm.enabled['RDFS'] = true;
    vm.enabled['OWL'] = true;
    vm.enabled['SKOS'] = false;
    
    vm.restoreListDefaults();
    vm.saveBlacklists();
  };

  /**
   * Restore blacklists to predefined list.
   */
  vm.restoreListDefaults = function () {
    let propertyItems = [];
    for (let pVoc in PROPERTY_BLACKLIST) {
      if (vm.enabled[pVoc] && PROPERTY_BLACKLIST.hasOwnProperty(pVoc)) {
        for (let i = 0; i < PROPERTY_BLACKLIST[pVoc].length; i++) {
          propertyItems.push(PREFIX[pVoc] + PROPERTY_BLACKLIST[pVoc][i]);
        }
      }
    }
    vm.propertyBlacklistInput = propertyItems.join(vm.separator);

    let classItems = [];
    for (let cVoc in CLASS_BLACKLIST) {
      if (vm.enabled[cVoc] && CLASS_BLACKLIST.hasOwnProperty(cVoc)) {
        for (let i = 0; i < CLASS_BLACKLIST[cVoc].length; i++) {
          classItems.push(PREFIX[cVoc] + CLASS_BLACKLIST[cVoc][i]);
        }
      }
    }
    vm.classBlacklistInput = classItems.join(vm.separator);
  };

  vm.initialize();

}

export default settingsCtrl;
