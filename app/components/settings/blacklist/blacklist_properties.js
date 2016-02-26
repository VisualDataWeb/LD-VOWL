const blacklistedProperties = {
  'RDF': ['type', 'first', 'rest', 'value', 'subject', 'predicate', 'object'],

  'RDFS': ['subClassOf', 'subPropertyOf', 'domain', 'range', 'label', 'comment', 'member', 'seeAlso', 'isDefinedBy'],

  'OWL': ['allValuesFrom', 'backwardCompatibleWith', 'cardinality', 'complementOf', 'differentFrom', 'disjointWith',
    'distinctMembers', 'equivalentClass', 'equivalentProperty', 'hasValue', 'imports', 'incompatibleWith',
    'intersectionOf', 'inverseOf', 'maxCardinality', 'minCardinality', 'oneOf', 'onProperty', 'priorVersion', 'sameAs',
    'someValuesFrom', 'unionOf', 'versionInfo'],

  'SKOS': ['altLabel', 'broadMatch', 'broader', 'broaderTransitive', 'changeNote', 'closeMatch', 'definition',
    'editorialNote', 'exactMatch', 'example', 'hasTopConcept', 'hiddenLabel', 'historyNote', 'inScheme',
    'mappingRelation', 'member', 'memberList', 'narrowMatch', 'narrower', 'narrowerTransitive', 'notation', 'note',
    'prefLabel', 'related', 'relatedMatch', 'scopeNote', 'semanticRelation', 'topConceptOf']
};

export default blacklistedProperties;
