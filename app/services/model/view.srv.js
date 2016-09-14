'use strict';

/**
 * @Name View
 */
function viewService() {

  let scale;
  let translate;

  /* jshint validthis: true */
  let that = this;

  that.getScale = function() {
    return scale;
  };

  that.setScale = function(newScale) {
    scale = newScale;
  };

  that.getTranslate = function() {
    return translate;
  };

  that.setTranslate = function(newTranslate) {
    translate = newTranslate;
  };

  that.reset = function () {
    scale = 1.0;
    translate = [0.0, 0.0];
  };

  that.reset();

}

export default viewService;
