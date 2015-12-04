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
    var found = false;

    for (var i = 0; i < this.blacklist.length; i++) {
      var currentBlacklistItem = this.blacklist[i];

      if (uriToCheck === currentBlacklistItem) {
        found = true;
        break;
      }
    }

    return found;
  }
}

module.exports = Extractor;
