export default function httpLessFilter() {

  return function (uri) {
    return uri.replace('http://', '');
  };

}
