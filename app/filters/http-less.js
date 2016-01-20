module.exports = function () {

  return function (uri) {
    return uri.replace('http://', '');
  };

};
