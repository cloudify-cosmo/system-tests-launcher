'use strict';

describe('Service: suitesYAMLLoader', function () {

  var loader, http;

  beforeEach(module('app.service.suitesYAMLLoader'));
  beforeEach(inject(function ($httpBackend, suitesYAMLLoader) {
    http = $httpBackend;
    loader = suitesYAMLLoader;
  }));

  it('should contain a load function', function () {
    expect(loader.load).toBeDefined();
  });

  it('should parse plain yaml files', function () {
    http.expectGET('suites.yaml').respond(200, 'a: 1\nb: 2');
    var testResponse = function(suitesYAML) {
      expect(suitesYAML).toEqual({a: 1, b:2});
    };
    var failTest = function(error) {
      expect(error).toBeUndefined();
    };
    loader.load('suites.yaml')
      .then(testResponse)
      .catch(failTest);
    http.flush();
  });

  it('should parse github base64 yaml files', function () {
    http.expectGET('suites.yaml').respond(200, {
      content: Base64.encode('a: 1\nb: 2')});
    var testResponse = function(suitesYAML) {
      expect(suitesYAML).toEqual({a: 1, b:2});
    };
    var failTest = function(error) {
      expect(error).toBeUndefined();
    };
    loader.load('suites.yaml')
      .then(testResponse)
      .catch(failTest);
    http.flush();
  });

  it('should call error handler on error', function() {
    http.expectGET('suites.yaml').respond(404);
    var expectFailure = function(error) {
      expect(error.status).toBe(404);
    };
    loader.load('suites.yaml')
      .then(fail)
      .catch(expectFailure);
    http.flush();
  });

});
