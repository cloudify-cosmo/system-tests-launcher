'use strict';

angular.module('app.service.focus', [])
  .factory('focus', function($timeout) {
    return function (id, blur) {
      $timeout(function () {
        var element = document.getElementById(id);
        if (element) {
          element.focus();
          if (blur) {
            element.blur();
          }
        }
      });
    };
  });
