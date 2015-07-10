'use strict';

angular.module('app.service.suitesYAMLLoader', [])
  .factory('suitesYAMLLoader', function ($log, $http, $q) {

    var loadSuitesYAML = function(url) {
      return $q(function (ok, err) {
        $http.get(url).then(function(response) {
          var rawSuitesYAML;
          if (response.data.content) {
            rawSuitesYAML = Base64.decode(response.data.content);
          } else {
            rawSuitesYAML = response.data;
          }
          var suitesYAML = jsyaml.load(rawSuitesYAML);
          ok(suitesYAML);
        }, function(error) {
          $log.error('Unable to fetch ' + url);
          if (err) {
            err(error);
          }
        });
      });
    };

    return {
      load: loadSuitesYAML
    };

  });
