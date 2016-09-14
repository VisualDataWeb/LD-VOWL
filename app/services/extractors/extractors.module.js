import angular from 'angular';

// import all extraction services
import TBoxExtractor from './t-box-extractor.srv';
import ClassExtractor from './class-extractor.srv';
import RelationExtractor from './relation-extractor.srv';
import TypeExtractor from './type-extractor.srv';
import DetailExtractor from './detail-extractor.srv';

// create a new module, register all services and return the name of the new module
export default angular.module('services.extractors', [])
  .service('TBoxExtractor', TBoxExtractor)
  .service('ClassExtractor', ClassExtractor)
  .service('RelationExtractor', RelationExtractor)
  .service('TypeExtractor', TypeExtractor)
  .service('DetailExtractor', DetailExtractor)
  .name;
