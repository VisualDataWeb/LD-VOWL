const blacklistedClasses = {
  'RDF': ['List', 'langString', 'HTML', 'XMLLiteral', 'Property', 'Bag', 'Seq', 'Alt'],

  'RDFS': ['Resource', 'Literal', 'Class', 'Datatype', 'Statement', 'Container', 'ContainerMembershipProperty'],

  'OWL': ['AllDifferent', 'AnnotationProperty', 'Class', 'DataRange', 'DatatypeProperty', 'DeprecatedClass',
    'DeprecatedProperty', 'FunctionalProperty', 'InverseFunctionalProperty', 'Nothing', 'ObjectProperty', 'Ontology',
    'OntologyProperty', 'Restriction', 'SymmetricProperty', 'Thing', 'TransitiveProperty'],

  'SKOS': ['Collection', 'Concept', 'ConceptScheme', 'OrderedCollection']
};

export default blacklistedClasses;
