'use strict';

module.exports = function () {

    var namespaces = [
        'owl: <http://www.w3.org/2002/07/owl#>',
        'rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>',
        'rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
        'xml: <http://www.w3.org/XML/1998/namespace>'
    ];

    var defaultLimit = 10;
    var defaultOffset = 0;
    var defaultLang = 'en';
    var defaultBaseClass = 'owl:Thing';

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
          "SELECT DISTINCT ?class (count(?sub) AS ?instanceCount) " +
          "WHERE { " +
            "?sub a ?class. " +
          "} " +
          "GROUP BY ?class " +
          "ORDER BY DESC(?instanceCount) " +
          "LIMIT " + limit + " OFFSET " + offset;
        return query;
      },

      getSubClassQuery: function (baseClass, labelLang, limit, offset) {

        // check parameters
        baseClass = (typeof baseClass === 'string') ? baseClass : defaultBaseClass;
        labelLang = (typeof labelLang === 'string') ? labelLang : defaultLang;
        limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;
        offset = (typeof offset === 'number' && offset >= 0) ? offset :defaultOffset;

        var query = prefixes() +
          "SELECT ?class (SAMPLE (?lbl) AS ?label) (count(DISTINCT ?subClass) AS ?count) " +
          "WHERE { " +
            "?class rdfs:subClassOf+ <" + baseClass + ">. " +
            "?subClass rdfs:subClassOf+ ?class. " +
            "?class rdfs:label ?lbl. " +
            "FILTER (langMatches(lang(?lbl),'" + labelLang + "')) " +
          "} " +
          "GROUP BY ?class ORDER BY DESC (?count) " +
          "LIMIT " + limit + " OFFSET " + offset;
          return query;
      },

      getSuperClassQuery: function (childClassURI, labelLang) {
        var query = prefixes() +
          "SELECT ?superClass (SAMPLE (?lbl) AS ?superClassLabel) " +
          "WHERE { " +
            "<" + childClassURI + "> rdfs:subClassOf  ?superClass. " +
            "?superClass rdfs:label ?lbl . " +
            "FILTER (langMatches(lang(?lbl),'" + labelLang + "')) " +
          "}";

        return query;
      },

      // PROPERTY QUERIES

      getLabelQuery: function (uri, labelLang) {
        var query = prefixes() +
        "SELECT (SAMPLE (?lbl) AS ?label) " +
        "WHERE { " +
          "<" + uri + "> rdfs:label ?lbl. " +
          "FILTER (langMatches(lang(?lbl), '" + labelLang + "'))" +
        "}";
        return query;
      },

      // TODO improve and use this one!
      getTopProperties: function (classURI) {
        var query = prefixes() +
          "SELECT DISTINCT ?prop (count(?instance) as ?count) " +
          "WHERE { " +
            "?instance a <" + classURI + ">. " +
            "?instance ?prop ?obj. " +
          " } " +
          "ORDER BY DESC(?count) " +
          "LIMIT 10";
          return query;
      },

      getReferringTypes: function (classURI, limit) {
        limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;

        var typeQuery = prefixes() +
          "SELECT ?valType (COUNT(?valType) AS ?count) " +
          "WHERE { " +
            "<" + classURI + "> ?prop ?val . " +
            "BIND (datatype(?val) AS ?valType) . " +
          "} " +
          "GROUP BY ?valType " +
          "ORDER BY ?count " +
          "LIMIT " + limit;

        return typeQuery;
      },

      getInstanceReferringTypesQuery: function (classURI, limit) {
        limit = (typeof limit === 'number' && limit > 0) ? limit : defaultLimit;

        var typeQuery = prefixes() +
          "SELECT (COUNT(?val) AS ?valCount) ?valType " +
          "WHERE { " +
            "?instance a <" + classURI + "> . " +
            "?instance ?prop ?val . " +
            "BIND (datatype(?val) AS ?valType) . " +
          "} " +
          "GROUP BY ?valType " +
          "LIMIT " + limit;
        return typeQuery;
      },

      getPropertyQuery: function (propertyType, domainClass, labelLang, limit) {
        var query = prefixes() +
          "SELECT ?property (SAMPLE (?lbl) AS ?label ) " +
          "WHERE { ?property a owl:" +  propertyType + ". " +
            "?property rdfs:domain " + domainClass + ". " +
            "?property rdfs:label ?lbl. " +
            "?property rdfs:range ?range. " +
            "FILTER langMatches(lang(?lbl), '" + labelLang + "') " +
          "} " +
          "GROUP BY ?property " +
          "ORDER BY ?property " +
          "LIMIT " + limit;
        return query;
      },

      getSubPropertyQuery: function (baseProperty, limit) {
        var query = prefixes() +
          "SELECT ?subProp (count(DISTINCT ?subProp) AS ?count) " +
          "WHERE { " +
            "?subProp rdfs:subPropertyOf+ <" + baseProperty + "> . " +
          "} " +
          "GROUP BY ?subProp " +
          "ORDER BY DESC (?count) " +
          "LIMIT " + limit;
        return query;
      },

      getSuperPropertyQuery: function (propertyURI) {
        var query = prefixes() +
          "SELECT ?superProp " +
          "WHERE { " +
            "<" + propertyURI + "> rdfs:subPropertyOf ?superProp. " +
          "}";
        return query;
      },

      // TODO also include childs of equivalent classes
      getChildCountQuery: function (classURI) {
        var query = prefixes() +
          "SELECT (count(?subClass) AS ?count) " +
          "WHERE { " +
            "?subClass rdfs:subClassOf <" + classURI + ">. " +
          "}";
        return query;
      },

      /**
       * Returns a SPARQL query for fetching all properties of the class with the given URI.
       * Uses rdfs:domain, this is really fast but does not work for every class.
       */
      getPropertyCountQuery: function (classURI) {
        var query = prefixes() +
          'SELECT (count(DISTINCT ?property) AS ?propertyCount) ' +
          'WHERE { ' +
            '{ ' +
              '?property rdfs:domain ?class. ' +                // property belongs to a class, ...
              '<' + classURI + '> rdfs:subClassOf+ ?class. ' +  // given class is sub class of this
            '} UNION { ' +                                      // OR:
              '?property rdfs:domain <' + classURI + '>. ' +    // property belongs to given class
            '} ' +
          '}';
        return query;
      },

      /**
       * More generic solution to get all the properties of a class, but much too complicated,
       * doesn't work on public endpoints like dbpedia because of timeout.
       */
      // getPropertyCountQuery: function (classURI) {
      //   var query = prefixes() +
      //     'SELECT (count(DISTINCT ?property) AS ?propertyCount) ' +
      //     'WHERE { ' +
      //       '?sub a <' +classURI +'>. ' +
      //       '?sub ?property ?obj. ' +
      //     '}';
      //   return query;
      // },

      /**
       * Query for range of a given property. Range label is NOT included, because some ranges have
       * no label and would be not be fetched otherwise.
       */
      getPropertyRangeQuery: function (propertyURI) {
        var query = prefixes() +
          'SELECT ?range ' +
          'WHERE { ' +
            '<' + propertyURI + '> rdfs:range ?range. ' +
          '}' +
          "GROUP BY ?range ";
          return query;
      },

      // RELATION queries

      getOrderedClassClassRelationQuery: function (originClass, targetClass, limit, offset) {
        var query = prefixes() +
            "SELECT (count(?originInstance) as ?count) ?prop " +
            "WHERE { " +
              "?originInstance a <" + originClass + "> ." +
              "?targetInstance a <" + targetClass + "> ." +
              "?originInstance ?prop ?targetInstance . " +
            "} " +
            "GROUP BY ?prop " +
            "ORDER BY DESC(?count)" +
            "LIMIT " + limit + " " +
            "OFFSET " + offset;
        return query;
      },

      //TODO this may be used if number of distinct props is to high
      getUnorderedClassClassRelationQuery: function (originClass, targetClass, limit, offset) {
        var query  = prefixes() +
          "SELECT distinct ?prop " +
          "WHERE { " +
            "?originInstance a <" + originClass + "> . " +
            "?targetInstance a <" + targetClass + "> . " +
            "?originInstance ?prop ?targetInstance . " +
          "}" +
          "LIMIT " + limit + " " +
          "OFFSET " + offset;
        return query;
      },

      getClassTypeRelationQuery: function (classURI, typeURI) {
        var query = prefixes() +
          "SELECT DISTINCT ?prop " +
          "WHERE { " +
            "?instance a <" + classURI + "> . " +
            "?instance ?prop ?val . " +
            "FILTER (datatype(?val) = <" + typeURI + ">) " +
          "} " +
          "LIMIT 1"; //TODO increase this for multiple edges

          return query;
      },

      // INSTANCE QUERIES

      getInstanceCountQuery: function (classURI) {
        var query = prefixes() +
          'SELECT (count(?instance) AS ?instanceCount) ' +
          'WHERE { ' +
          '?instance a <' + classURI + '>. ' +
          '}';
        return query;
      },

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
          "SELECT ?comment " +
          "WHERE { " +
            "<" + uri + "> rdfs:comment ?comment . " +
          "} " +
          "LIMIT 1";
          return commentQuery;
      }

    };
  };
