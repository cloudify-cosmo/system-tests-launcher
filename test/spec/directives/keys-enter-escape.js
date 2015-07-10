'use strict';

describe('Directives: stlEnter and stlEscape', function () {

  var scope, element;

  beforeEach(module('app.directive.keys'));
  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.enterCalled = 0;
    scope.escapeCalled = 0;
    scope.enter = function() {
      scope.enterCalled += 1;
    };
    scope.escape = function() {
      scope.escapeCalled += 1;
    };
    element = $compile(
      '<div stl-enter="enter()" stl-escape="escape()"></div>')(scope);
    scope.$digest();
  }));

  it('should call escape callback on keydown', function () {
    element.triggerHandler({type: 'keydown', which: 27});
    expect(scope.enterCalled).toBe(0);
    expect(scope.escapeCalled).toBe(1);
  });

  it('should call escape callback on keypress', function () {
    element.triggerHandler({type: 'keypress', which: 27});
    expect(scope.enterCalled).toBe(0);
    expect(scope.escapeCalled).toBe(1);
  });

  it('should call enter callback on keydown', function () {
    element.triggerHandler({type: 'keydown', which: 13});
    expect(scope.escapeCalled).toBe(0);
    expect(scope.enterCalled).toBe(1);
  });

  it('should call enter callback on keypress', function () {
    element.triggerHandler({type: 'keypress', which: 13});
    expect(scope.escapeCalled).toBe(0);
    expect(scope.enterCalled).toBe(1);
  });

  it('should not call any handler on other keydown/keypress', function () {
    element.triggerHandler({type: 'keypress', which: 30});
    element.triggerHandler({type: 'keydown', which: 30});
    expect(scope.escapeCalled).toBe(0);
    expect(scope.enterCalled).toBe(0);
  });

});
