/**
 * @name Extractor
 */
class Extractor {

  /**
   * Creates a new Extractor initializing its blacklist.
   */
  constructor() {
    this.blacklist = [];
  }

  /**
   * Returns the blacklist of this Extractor.
   *
   * @returns {Array|*}
   */
  getBlacklist () {
    return this.blacklist;
  }

  /**
   * Replaces the blacklist of this Extractor with the given one.
   *
   * @param newBlacklist - the new blacklist for this Extractor
   */
  setBlacklist(newBlacklist) {
    this.blacklist = newBlacklist;
  }

  /**
   * Returns true if the given URI is black listed, false otherwise.
   *
   * @param uriToCheck - the URI to be checked
   * @returns {boolean}
   */
  inBlacklist(uriToCheck) {
    return (this.blacklist.indexOf(uriToCheck) !== -1);
  }

}

module.exports = Extractor;
