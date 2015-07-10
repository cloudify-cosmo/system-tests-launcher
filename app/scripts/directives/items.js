'use strict';

angular.module('app.directive.items', [])
  .directive('stlItems', function() {
    var link = function(scope) {
      scope.overview = scope.$parent.overview;
      scope.calculate = scope.$parent.calculate;
    };
    return {
      restrict: 'E',
      link: link,
      scope: {
        items: '=',
        type: '@input'
      },
      templateUrl: 'views/items.html'
    };
  });
