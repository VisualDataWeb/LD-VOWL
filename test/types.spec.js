import app from '../app/app';

describe('Service: Types', function() {

  let typesService;
  let typeToAdd = {};

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function(Types) {
    typesService = Types  ;
  }));

  it('should have a types service', function () {
    expect(typesService).toBeDefined();
  });

  it('should be possible to add a type', function () {
    typesService.addType(typeToAdd);
    expect(typesService.getTypes().length).toBe(1);
  });

  it('should return an empty array of types', function () {
    expect(typesService.getTypes().length).toBe(0);
  });

});
