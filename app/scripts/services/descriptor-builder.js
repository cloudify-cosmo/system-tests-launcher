'use strict';

angular.module('app.service.descriptorBuilder', [])
  .factory('descriptorBuilder', function() {

    var build = function(suites, customSuites) {
      var descriptorSuites = _.map(suites, function(v) {
        return v.name;
      });
      _.forEach(customSuites, function(v) {
        var tests = _.map(v.tests, function(v2) { return v2.name; }).join(',');
        var config = v.handlerConfiguration.name;
        descriptorSuites.push(tests + '@' + config);
      });

      return descriptorSuites.join('#');
    };

    return {
      build: build
    };
  });
