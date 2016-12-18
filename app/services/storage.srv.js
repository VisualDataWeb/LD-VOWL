export default storage;

/**
 * @ngdoc service
 * @name Storage
 *
 * @param {$log} $log
 *
 * Uses either Local- or SessionStorage to save and retrieve data across page reloads.
 *
 * @ngInject
 */
function storage($log) {

  const self = this;

  self.useSessionStorage = __SESSION_STORAGE__; // eslint-disable-line no-undef

  /**
   * Retrieves the data for the given key from Local- or SessionStorage.
   *
   * @param {string} key - the key of the data to retrieve

   * @return {*}
   */
  self.getItem = function(key) {
    const storage = (self.useSessionStorage) ? sessionStorage : localStorage;

    if (storage !== undefined) {
      return storage.getItem(key);
    } else {
      const storageType = (self.useSessionStorage) ? 'SessionStorage' : 'LocalStorage';
      $log.error(`[Storage] Unable to get data for '${key}', ${storageType} is unavailable!`);
      return undefined;
    }
  };

  /**
   * Stores the given textual data under the also given key using Local- or SessionStorage.
   *
   * @param {string} key - the key to retrieve the data after it is saved
   * @param {string} data - the text to save
   */
  self.setItem = function(key, data) {
    let storage = (self.useSessionStorage) ? sessionStorage : localStorage;

    if (storage !== undefined) {
      storage.setItem(key, data);
    } else {
      const storageType = (self.useSessionStorage) ? 'SessionStorage' : 'LocalStorage';
      $log.error(`[Storage] Unable to store data for '${key}', ${storageType} is unavailable!`);
    }
  };

}
