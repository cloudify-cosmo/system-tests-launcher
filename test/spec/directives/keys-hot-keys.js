'use strict';

describe('Directives: stlHotKeys', function () {

  var scope, element, compile;

  beforeEach(module('app.directive.keys'));
  beforeEach(function() {
      module(function($provide) {
        $provide.value('focus', function(id, blur) {
          scope.expectedCalled = true;
          scope.arg1 = id;
          scope.arg2 = blur;
        });
      });
      inject(function ($rootScope, $compile) {
          scope = $rootScope.$new();
          compile = $compile;
        }
      );
  });

  var testKeySequence = function(keySequence, name, expectedArg1, expectedArg2)  {
    it('should trigger ' + name + 'on "' + keySequence + '" key sequence', function () {
      scope.expectedCalled = false;
      scope.suites = {all: 'suite'};
      scope.configurations = {all: 'configuration'};
      scope.tests = {all: 'test'};
      scope[name] = function(arg1, arg2) {
        scope.expectedCalled = true;
        scope.arg1 = arg1;
        scope.arg2 = arg2;
      };
      element = compile('<div stl-hot-keys></div>')(scope);
      scope.$digest();
      _.forEach(keySequence, function(c) {
        KeyEvent.simulate(c.charCodeAt(0));
      });
      expect(scope.expectedCalled).toBe(true);
      if (expectedArg1) {
        expect(scope.arg1).toEqual(expectedArg1);
      }
      if (expectedArg2) {
        expect(scope.arg2).toEqual(expectedArg2);
      }
    });
  };

  testKeySequence('ac', 'applyCustom');
  testKeySequence('ll', 'launchConfiguration');
  testKeySequence('rr', 'reset');
  testKeySequence('do', 'descriptorOverview');

  testKeySequence('fb', 'stub', 'branch_input');
  testKeySequence('fq', 'stub', 'configuration_input');
  testKeySequence('ft', 'stub', 'custom_tests_input');
  testKeySequence('fd', 'stub', 'descriptor');

  testKeySequence('ss', 'startSearch', 'suite', 'Select Suite');
  testKeySequence('sc', 'startSearch', 'configuration', 'Select Configuration');
  testKeySequence('st', 'startSearch', 'test', 'Select Test');

});
