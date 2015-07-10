'use strict';

describe('Controller: SystemTestsController', function () {

  var SystemTestsController, scope;
  var values = {};

  beforeEach(module('app'));
  beforeEach(function() {
    module(function ($provide) {
      $provide.value('suitesYAMLLoader', {
        load: function(suitesYAMLURL) {
          return {
            then: function(callback) {
              callback(suitesYAMLURL);
            }
          };
        }
      });
      $provide.value('suitesYAMLProcessor', {
        process: function(suitesYAML) {
          values.processCalledWith = suitesYAML;
          return {};
        }
      });
    });
    inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
      SystemTestsController = $controller('SystemTestsController', {
        $scope: scope
      });
    });
  });

  it('should set branch to master on scope', function () {
    expect(scope.branch).toBe('master');
  });

  it('should set configuration on scope', function () {
    expect(scope.configuration).toBe('root/cosmo/master/Tests/CoreSystemTests');
  });

  it('should call suites yaml loader which should then call suites yaml ' +
     'processor with the result', function () {
    expect(values.processCalledWith).toContain('suites.yaml');
  });

});
