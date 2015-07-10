'use strict';

(function() {

  var keyDirective = function (which, attr) {
    return function () {
      var link = function (scope, element, attrs) {
        element.on('keydown keypress', function (event) {
          if (event.which === which) {
            scope.$apply(function () {
              scope.$eval(attr(attrs), {'event': event});
            });
            event.preventDefault();
          }
        });
      };
      return {
        link: link
      };
    };
  };

  angular.module('app.directive.keys', ['app.service.focus', 'cfp.hotkeys'])
    .directive('stlEnter',  keyDirective(13, function (attrs) { return attrs.stlEnter; }))
    .directive('stlEscape', keyDirective(27, function (attrs) { return attrs.stlEscape; }))
    .directive('stlHotKeys', function(hotkeys, focus) {

      var link = function(scope) {
        var $scope = scope;

        var focusCallback = function(elemID) {
          return function(event) {
            focus(elemID);
            event.preventDefault();
          };
        };

        var searchCallback = function(items, searchLabel) {
          return function(event) {
            $scope.startSearch($scope[items].available, searchLabel);
            event.preventDefault();
          };
        };

        hotkeys.bindTo($scope)
          .add({
            combo: 'a c',
            description: 'Apply Custom Suite',
            callback: $scope.applyCustom
          })
          .add({
            combo: 'l l',
            description: 'Launch Configuration in QuickBuild',
            callback: $scope.launchConfiguration
          })
          .add({
            combo: 'r r',
            description: 'Reset',
            callback: $scope.reset
          })
          .add({
            combo: 'd o',
            description: 'Descriptor Overview',
            callback: $scope.descriptorOverview
          })
          .add({
            combo: 'f b',
            description: 'Focus Branch',
            callback: focusCallback('branch_input')
          })
          .add({
            combo: 'f q',
            description: 'Focus QuickBuild Configuration',
            callback: focusCallback('configuration_input')
          })
          .add({
            combo: 'f t',
            description: 'Focus Custom Tests',
            callback: focusCallback('custom_tests_input')
          })
          .add({
            combo: 'f d',
            description: 'Focus Descriptor',
            callback: focusCallback('descriptor')
          })
          .add({
            combo: 's s',
            description: 'Select Suite',
            callback: searchCallback('suites', 'Select Suite')
          })
          .add({
            combo: 's c',
            description: 'Select Configuration',
            callback: searchCallback('configurations', 'Select Configuration')
          })
          .add({
            combo: 's t',
            description: 'Select Test',
            callback: searchCallback('tests', 'Select Test')
          });
      };
      return {
        restrict: 'A',
        link: link
      };

    });

})();
