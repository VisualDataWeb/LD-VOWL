/**
 * Created by marc on 01.12.15.
 */
class Extractor {

  constructor() {
    this.blacklist = [];
  }

  getBlacklist () {
    return this.blacklist;
  }

  setBlacklist(newBlacklist) {
    this.blacklist = newBlacklist;
  }

  inBlacklist(uriToCheck) {
    return (this.blacklist.indexOf(uriToCheck) !== -1);
  }

}

module.exports = Extractor;
