/**
 * @ngdoc service
 * @name View
 */
function viewService() {

  let that = this;

  let scale;
  let translate;

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
