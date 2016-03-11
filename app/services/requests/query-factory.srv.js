'use strict';

function queryFactory() {

  var namespaces = [
    'rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
    'skos: <http://www.w3.org/2004/02/skos/core#>'
  ];

  var defaultLimit = 10;
  var defaultOffset = 0;
  var defaultLang = 'en';

  var prefixes = function () {
    var pre = '';
    for (var i = 0; i < namespaces.length; i++) {
      pre += 'PREFIX ';
      pre += namespaces[i];
      pre += ' ';
    }
    return pre;
  };

  // Public API here
  return {

    // NAMESPACES

    /**
     * Returns the prefixes for SPARQL queries, including the used namespaces.
     */
    getPrefixes: function () {
      return prefixes();
    },

    // CLASS QUERIES

    getClassQuery: function (limit, offset) {

      // check parameters
      limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;
      offset = (typeof offset === 'number' && offset >= 0) ? offset : defaultOffset;

      // build query and return it
      var query = prefixes() +
        'SELECT DISTINCT ?class (count(?sub) AS ?instanceCount) ' +
        'WHERE { ' +
          '?sub a ?class. ' +
        '} ' +
        'GROUP BY ?class ' +
        'ORDER BY DESC(?instanceCount) ' +
        'LIMIT ' + limit + ' ' +
        'OFFSET ' + offset;
      return query;
    },

    // PROPERTY QUERIES

    getLabelQuery: function (uri, labelLang) {
      labelLang = labelLang || defaultLang;

      var query = prefixes() +
      'SELECT (SAMPLE (?lbl) AS ?label) ' +
      'WHERE { ' +
        '<' + uri + '> rdfs:label ?lbl. ' +
        "FILTER (langMatches(lang(?lbl), '" + labelLang + "'))" +
      '}';
      return query;
    },

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

    getPreferredLabelQuery: function (uri, labelLang) {
      labelLang = labelLang || defaultLang;

      var query = prefixes() +
          'SELECT ?label ' +
          'WHERE { ' +
            '<' + uri + '> skos:prefLabel ?label . ' +
            "FILTER (langMatches(lang(?label), '" + labelLang + "')) " +
          '}';
      return query;
    },

    getInstanceReferringTypesQuery: function (classURI, limit) {
      limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;

      var typeQuery = prefixes() +
        'SELECT (COUNT(?val) AS ?valCount) ?valType ' +
        'WHERE { ' +
          '?instance a <' + classURI + '> . ' +
          '?instance ?prop ?val . ' +
          'BIND (datatype(?val) AS ?valType) . ' +
        '} ' +
        'GROUP BY ?valType ' +
        'LIMIT ' + limit;
      return typeQuery;
    },

    // RELATION queries

    getOrderedClassClassRelationQuery: function (originClass, targetClass, limit, offset) {
      var query = prefixes() +
          'SELECT (count(?originInstance) as ?count) ?prop ' +
          'WHERE { ' +
            '?originInstance a <' + originClass + '> . ' +
            '?targetInstance a <' + targetClass + '> . ' +
            '?originInstance ?prop ?targetInstance . ' +
          '} ' +
          'GROUP BY ?prop ' +
          'ORDER BY DESC(?count) ' +
          'LIMIT ' + limit + ' ' +
          'OFFSET ' + offset;
      return query;
    },

    getUnorderedClassClassRelationQuery: function (originClass, targetClass, limit, offset) {
      var query  = prefixes() +
        'SELECT DISTINCT ?prop ' +
        'WHERE { ' +
          '?originInstance a <' + originClass + '> . ' +
          '?targetInstance a <' + targetClass + '> . ' +
          '?originInstance ?prop ?targetInstance . ' +
        '} ' +
        'LIMIT ' + limit + ' ' +
        'OFFSET ' + offset;
      return query;
    },

    getOrderedClassTypeRelationQuery: function (classURI, typeURI, limit = 5, offset = 0) {
      const query = prefixes() +
        'SELECT (count(?instance) AS ?count) ?prop ' +
        'WHERE { ' +
          `?instance a <${classURI}> . ` +
          '?instance ?prop ?val . ' +
          `FILTER (datatype(?val) = <${typeURI}>) ` +
        '} ' +
        'GROUP BY ?prop ' +
        'ORDER BY DESC(?count) ' +
        `LIMIT ${limit} ` +
        `OFFSET ${offset}`;

        return query;
    },

    getUnorderedClassTypeRelationQuery: function (classURI, typeURI, limit = 5, offset = 0) {
      const query = prefixes() +
        'SELECT DISTINCT ?prop ' +
        'WHERE { ' +
        `?instance a <${classURI}> . ` +
        '?instance ?prop ?val . ' +
        `FILTER (datatype(?val) = <${typeURI}>) ` +
        '} ' +
        `LIMIT ${limit} ` +
        `OFFSET ${offset}`;

      return query;
    },

    // INSTANCE QUERIES

    getNumberOfCommonInstancesQuery: function (classURI1, classURI2) {
      var query = prefixes() +
        'SELECT (count(?commonInstance) AS ?commonInstanceCount) ' +
        'WHERE { ' +
          '?commonInstance a <' + classURI1 + '>. ' +
          '?commonInstance a <' + classURI2 + '>. ' +
        '}';
      return query;
    },

    // DETAILS QUERIES

    getCommentQuery: function (uri) {
      var commentQuery = prefixes() +
        'SELECT ?comment ' +
        'WHERE { ' +
          '<' + uri + '> rdfs:comment ?comment . ' +
        '} ' +
        'LIMIT 1';
        return commentQuery;
    }

  }; // end of public API to return

} // end of queryFactory()

export default queryFactory;
