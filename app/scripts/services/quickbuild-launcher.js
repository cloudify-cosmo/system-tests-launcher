'use strict';

angular.module('app.service.quickbuildLauncher', [])
  .factory('quickbuildLauncher', function ($http, $log, $window) {

    var launchQuickbuildConfiguration = function(webEndpoint,
                                                 restEndpoint,
                                                 configuration,
                                                 branch,
                                                 descriptor) {
      var configPathToConfigID = restEndpoint + '/ids?configuration_path=' + configuration;

      $http.get(configPathToConfigID).then(function(response) {
        $log.info('requesting build for configuration id: ' + response.data);
        var configurationID = response.data;

        var variables = [
          { key: 'system_tests_branch',
            val: branch},
          { key: 'system_tests_descriptor',
            val: descriptor }];

        var variablesXML = _.map(variables, function(v) {
          return '' +
            '<entry>' +
            '<string>' + v.key + '</string>' +
            '<string>' + v.val + '</string>' +
            '</entry>';
        }).join('');

        var requestXML = '' +
          '<com.pmease.quickbuild.BuildRequest>' +
          '<configurationId>' + configurationID + '</configurationId>' +
          '<respectBuildCondition>true</respectBuildCondition>' +
          '<variables>' + variablesXML + '</variables>' +
          '</com.pmease.quickbuild.BuildRequest>';

        var buildRequest = restEndpoint + '/build_requests';

        $http({
          url: buildRequest,
          method: 'POST',
          withCredentials: true,
          data: requestXML}).then(function (response) {
          $window.location.assign(webEndpoint + '/overview/' + configurationID);
        }, function(error) {
          $log.error('Failed launching configuration ' + configuration);
        });
      }, function(error) {
        $log.error('Failed getting configuration id for ' + configuration);
      });
    };

    return {
      launch: launchQuickbuildConfiguration
    };

  });
