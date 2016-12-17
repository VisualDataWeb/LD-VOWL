export default function uriLabelFilter() {

  return function (uri) {
    let uriLabel = '';
    if (uri !== undefined && uri !== '') {
      const lastSlash = uri.lastIndexOf('/');
      const lastHash = uri.lastIndexOf('#');
      uriLabel = uri.substr(Math.max(lastSlash, lastHash) + 1).replace(/\_/g, ' ');
    }
    return uriLabel;
  };

}
