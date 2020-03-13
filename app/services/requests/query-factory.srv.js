/**
 * @ngdoc service
 * @name QueryFactory
 */
function queryFactory() {

  const namespaces = [
    'rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
    'skos: <http://www.w3.org/2004/02/skos/core#>'
  ];

  const defaultLimit = 10;
  const defaultOffset = 0;
  const defaultLang = 'en';

  const prefixes = function () {
    let pre = '';
    for (let i = 0; i < namespaces.length; i++) {
      pre += 'PREFIX ';
      pre += namespaces[i];
      pre += ' ';
    }
    return pre;
  };

  // NAMESPACES

  /**
   * Returns the prefixes for SPARQL queries, including the used namespaces.
   * @return {string} the prefixes
   */
  this.getPrefixes = function () {
    return prefixes();
  };

  // CLASS QUERIES

  this.getClassQuery = function(limit, offset) {
    // check parameters
    limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;
    offset = (typeof offset === 'number' && offset >= 0) ? offset : defaultOffset;

    // build query and return it
    return prefixes() +
      `SELECT DISTINCT ?class (count(?sub) AS ?instanceCount) ` +
      `WHERE { ` +
        `?sub a ?class. ` +
      `} ` +
      `GROUP BY ?class ` +
      `HAVING (count(?sub) > 0) ` +
      `ORDER BY DESC(?instanceCount) ` +
      `LIMIT ${limit} ` +
      `OFFSET ${offset}`;
  };

  // PROPERTY QUERIES

  this.getLabelQuery = function(uri, labelLang) {
    labelLang = labelLang || defaultLang;

    return prefixes() +
      `SELECT (SAMPLE (?lbl) AS ?label) ` +
      `WHERE { ` +
        `<${uri}> rdfs:label ?lbl. ` +
        `FILTER (langMatches(lang(?lbl), '${labelLang}')) ` +
      `}`;
  };

  // alternative without SAMPLE
  //
  //getLabelQuery: function (uri, labelLang = defaultLang) {
  //  return prefixes() +
  //    `SELECT (?label)
  //  WHERE {
  //    <${uri}> rdfs:label ?label.
  //    FILTER (langMatches(lang(?label), "${labelLang}"))
  //  }
  //  LIMIT 1`;
  //},

  this.getPreferredLabelQuery= function(uri, labelLang) {
    labelLang = labelLang || defaultLang;

    return prefixes() +
      `SELECT ?label ` +
      `WHERE { ` +
        `<${uri}> skos:prefLabel ?label . ` +
        `FILTER (langMatches(lang(?label), '${labelLang}')) ` +
      `}`;
  };

  this.getInstanceReferringTypesQuery = function(classURI, limit) {
    limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;

    return prefixes() +
      `SELECT (COUNT(?val) AS ?valCount) ?valType ` +
      `WHERE { ` +
        `?instance a <${classURI}> . ` +
        `?instance ?prop ?val . ` +
        `BIND (datatype(?val) AS ?valType) . ` +
      `} ` +
      `GROUP BY ?valType ` +
      `HAVING (count(?val) > 0) ` +
      `ORDER BY DESC(?valCount) ` +
      `LIMIT ${limit}`;
  };

  // RELATION queries

  this.getOrderedClassClassRelationQuery = function(originClass, targetClass, limit, offset) {
    return prefixes() +
      `SELECT (count(?originInstance) as ?count) ?prop ` +
      `WHERE { ` +
        `?originInstance a <${originClass}> . ` +
        `?targetInstance a <${targetClass}> . ` +
        `?originInstance ?prop ?targetInstance . ` +
      `} ` +
      `GROUP BY ?prop ` +
      `HAVING (count(?originInstance) > 0) ` +
      `ORDER BY DESC(?count) ` +
      `LIMIT ${limit} ` +
      `OFFSET ${offset}`;
  };

  this.getUnorderedClassClassRelationQuery = function(originClass, targetClass, limit, offset) {
    return prefixes() +
      `SELECT DISTINCT ?prop ` +
      `WHERE { ` +
        `?originInstance a <${originClass}> . ` +
        `?targetInstance a <${targetClass}> . ` +
        `?originInstance ?prop ?targetInstance . ` +
      `} ` +
      `LIMIT ${limit} ` +
      `OFFSET ${offset} `;
  };

  this.getOrderedClassTypeRelationQuery = function(classURI, typeURI, limit = 5, offset = 0) {
    return prefixes() +
      `SELECT (count(?instance) AS ?count) ?prop ` +
      `WHERE { ` +
        `?instance a <${classURI}> . ` +
        `?instance ?prop ?val . ` +
        `FILTER (datatype(?val) = <${typeURI}>) ` +
      `} ` +
      `GROUP BY ?prop ` +
      `HAVING (count(?instance) > 0) ` +
      `ORDER BY DESC(?count) ` +
      `LIMIT ${limit} ` +
      `OFFSET ${offset}`;
  };

  this.getUnorderedClassTypeRelationQuery = function(classURI, typeURI, limit = 5, offset = 0) {
    return prefixes() +
      `SELECT DISTINCT ?prop ` +
      `WHERE { ` +
        `?instance a <${classURI}> . ` +
        `?instance ?prop ?val . ` +
        `FILTER (datatype(?val) = <${typeURI}>) ` +
      `} ` +
      `LIMIT ${limit} ` +
      `OFFSET ${offset}`;
  };

  // INSTANCE QUERIES

  this.getNumberOfCommonInstancesQuery = function(classURI1, classURI2) {
    return prefixes() +
      `SELECT (count(?commonInstance) AS ?commonInstanceCount) ` +
      `WHERE { ` +
        `?commonInstance a <${classURI1}>. ` +
        `?commonInstance a <${classURI2}>. ` +
      `}`;
  };

  // DETAILS QUERIES

  this.getCommentQuery = function(uri) {
    return prefixes() +
      `SELECT ?comment ` +
      `WHERE { ` +
        `<${uri}> rdfs:comment ?comment . ` +
      `} ` +
      `LIMIT 1`;
  };

} // end of queryFactory()

export default queryFactory;
