'use strict';

angular.module('app.service.suitesYAMLProcessor', [])
  .factory('suitesYAMLProcessor', function () {

    var toList = function(obj) {
      return _.map(obj, function(v, k) {
        v.name = k;
        return v;
      });
    };

    var createTestObject = function(testName) {
      return {
        name: testName,
        selected: false,
        tests: ['cloudify-system-tests' + '/' + testName],
        type: 'test'
      };
    };

    var processSuitesYAML = function(suitesYAML) {

      /*jshint -W106 */
      var rawHandlerConfigurations = suitesYAML.handler_configurations;
      var rawTestSuites = suitesYAML.test_suites;
      /*jshint +W106 */

      var configurations = _.map(toList(rawHandlerConfigurations), function(v) {
        v.env = v.env || v.handler;
        v.type = 'configuration';
        v.selected = false;
        return v;
      });
      var tests = _.map(toList(suitesYAML.tests), function(v) {
        v.type = 'test';
        v.selected = false;
        var repo = 'cloudify-system-tests';
        if (v.external) {
          repo = v.external.repo;
        }
        v.tests = _.map(v.tests, function(test) {
          return repo + '/' + test;
        });
        return v;
      });
      var suites = _.map(toList(rawTestSuites), function(v) {
        /*jshint -W106 */
        v.handlerConfiguration = v.handler_configuration;
        delete v.handler_configuration;
        /*jshint +W106 */
        var handlerConfiguration = rawHandlerConfigurations[v.handlerConfiguration];
        v.env = handlerConfiguration.env;
        v.type = 'suite';
        v.tests = _.flatten(_.map(v.tests, function(test) {
          var testGroup = _.find(tests, function(v) {
            return test === v.name;
          });
          if (testGroup) {
            return testGroup.tests;
          } else {
            return 'cloudify-system-tests/' + test;
          }
        }));
        return v;
      });

      return {
        configurations: configurations,
        suites: suites,
        tests: tests
      };
    };

    return {
      createTestObject: createTestObject,
      process: processSuitesYAML
    };

  });
