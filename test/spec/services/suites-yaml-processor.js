'use strict';

describe('Service: suitesYAMLProcessor', function () {

  var processor;

  beforeEach(module('app.service.suitesYAMLProcessor'));
  beforeEach(inject(function (suitesYAMLProcessor) {
    processor = suitesYAMLProcessor;
  }));

  it('should contain a process and createTestObject functions', function () {
    expect(processor.process).toBeDefined();
    expect(processor.createTestObject).toBeDefined();
  });

  it('createTestObject should create a valid test object', function () {
    expect(processor.createTestObject('my-test')).toEqual({
      name: 'my-test',
      selected: false,
      tests: ['cloudify-system-tests/my-test'],
      type: 'test'
    });
  });

  it('should create a list of configurations for handler_configurations', function() {
    var suitesYAML = {'handler_configurations': {
      config1: { env: 'env1'         },
      config2: { handler: 'handler1' }
    }};
    var processed = processor.process(suitesYAML);
    expect(processed.configurations).toEqual([
      {name: 'config1', env: 'env1', type: 'configuration', selected: false},
      {name: 'config2', env: 'handler1', handler: 'handler1', type: 'configuration', selected: false}]);
  });

  it('should create a list of tests', function() {
    var suitesYAML = {tests: {
      test1: { tests: ['a', 'b'] },
      test2: { tests: ['c', 'd'], external: { repo: 'my-repo' } }
    }};
    var processed = processor.process(suitesYAML);
    expect(processed.tests).toEqual([
      { name: 'test1',
        type: 'test',
        selected: false,
        tests: ['cloudify-system-tests/a',
                'cloudify-system-tests/b']},
      { name: 'test2',
        type: 'test',
        selected: false,
        tests: ['my-repo/c',
                'my-repo/d'],
        external: { repo: 'my-repo' }
      }]);
  });

  it('should create a list of suites', function() {
    var suitesYAML = {
      tests: {
        tests1: {tests: 'a'},
        tests2: {tests: 'b', external: { repo: 'my-repo' }}
      },
      'handler_configurations': {
        config1: { env: 'env1' },
        config2: { handler: 'handler1' }
      },
      'test_suites': {
        suite1: {
          'handler_configuration': 'config1',
          tests: ['tests1', 'my/test.py']
        },
        suite2: {
          'handler_configuration': 'config2',
          tests: ['tests2', 'my/test2.py']
        }
      }
    };
    var processed = processor.process(suitesYAML);
    expect(processed.suites).toEqual([
      { name: 'suite1',
        env: 'env1',
        type: 'suite',
        handlerConfiguration: 'config1',
        tests: ['cloudify-system-tests/a',
                'cloudify-system-tests/my/test.py']},
      { name: 'suite2',
        env: 'handler1',
        type: 'suite',
        handlerConfiguration: 'config2',
        tests: ['my-repo/b',
                'cloudify-system-tests/my/test2.py']}
    ]);

  });

});
