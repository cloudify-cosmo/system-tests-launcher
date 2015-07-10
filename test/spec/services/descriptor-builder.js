'use strict';

describe('Service: descriptorBuilder', function () {

  var builder;

  beforeEach(module('app.service.descriptorBuilder'));
  beforeEach(inject(function (descriptorBuilder) {
    builder = descriptorBuilder;
  }));

  it('should contain a build function', function () {
    expect(builder.build).toBeDefined();
  });

  it('it should concat suites names with #', function() {
    var suites = [{name: 'one'}, {name: 'two'}];
    expect(builder.build(suites, [])).toEqual(
      'one#two');
  });

  it('it should concat custom suites names with @ between tests and handler' +
     ' configuration', function() {
    var customSuites = [
      { tests: [{name: 'one'}, {name: 'two'}],
        handlerConfiguration: {name: 'config1'}},
      { tests: [{name: 'three'}, {name: 'four'}],
        handlerConfiguration: {name: 'config2'}}
    ];
    expect(builder.build([], customSuites)).toEqual(
      'one,two@config1#three,four@config2');
  });

  it('it should handle suites, then custom suites', function() {
    var suites = [{name: 'suite1'}];
    var customSuites = [
      { tests: [{name: 'test1'}],
        handlerConfiguration: {name: 'config1'}}
    ];
    expect(builder.build(suites, customSuites)).toEqual('suite1#test1@config1');
  });

});
