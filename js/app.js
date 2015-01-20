function SystemTestsController($http, $scope, $timeout, $log) {

  $scope.branch = 'master';
  $scope.configuration = 'root/cosmo/master/Tests/CoreSystemTests';

  $scope.reset = function() {
    $scope.suites.selected = [];
    $scope.custom_suites = [];
    $scope.used_envs = [];
    $scope.descriptor = '';

    $scope.current_custom = {
      tests: []
    };
    $scope.current_custom_tests = '';
    $scope.suites.available = $scope.suites.all || [];
    $scope.configurations.available = $scope.configurations.all || [];
    $scope.tests.available = $scope.tests.all || [];
    if ($scope.configurations.all) {
      _.forEach($scope.configurations.all, function(v) {
        v.class = '';
      });
    }
    if ($scope.tests.all) {
      _.forEach($scope.tests.all, function(v) {
        v.class = '';
      });
    }
  };

  $scope.configurations = {};
  $scope.tests = {};
  $scope.suites = {};
  $scope.reset();

  function toList(obj) {
    return _.map(obj, function(v, k) {
      v.name = k;
      return v;
    })
  }

  function processSuitesYaml(response) {
    var raw_suites_yaml;
    if (response.data.content) {
      raw_suites_yaml = Base64.decode(response.data.content);
    } else {
      raw_suites_yaml = response.data;
    }
    var suites_yaml = jsyaml.load(raw_suites_yaml);

    $scope.configurations.all = _.map(toList(suites_yaml.handler_configurations), function(v) {
      v.env = v.env || v.handler;
      v.type = 'configuration';
      v.class = '';
      return v;
    });
    $scope.tests.all = _.map(toList(suites_yaml.tests), function(v) {
      v.type = 'test';
      v.class = '';
      repo = 'cloudify-system-tests';
      if (v.external) {
        repo = v.external.repo;
      }
      v.tests = _.map(v.tests, function(test) {
        return repo + '/' + test;
      });
      return v;
    });
    $scope.suites.all = _.map(toList(suites_yaml.test_suites), function(v) {
      var handler_configuration = suites_yaml.handler_configurations[v.handler_configuration];
      v.env = handler_configuration.env;
      v.type = 'suite';
      v.tests = _.flatten(_.map(v.tests, function(test) {
        test_group = _.find($scope.tests.all, function(v) {
          return test === v.name;
        });
        if (test_group) {
          return test_group.tests;
        } else {
          return 'cloudify-system-tests/' + test;
        }
      }));
      return v;
    });

    $scope.reset();
  }

  $scope.addCustomTests = function() {
    var tests = _.uniq($scope.current_custom_tests.split(','));
    tests = _.map(tests, function(v) {
      return {
        name: v,
        'class': '',
        tests: ['cloudify-system-tests' + '/' + v],
        type: 'test'
      };
    });
    all_test_names = _.map($scope.tests.all, function(v) { return v.name; });
    tests = _.filter(tests, function(test) {
      return !_.contains(all_test_names, test.name);
    });
    $scope.tests.all = $scope.tests.all.concat(tests);
    $scope.current_custom_tests = '';
    $scope.calculate({});
  };

  $scope.calculate = function(item) {
    if (item.type === 'suite') {
      $scope.suites.selected.push(item);
      $scope.used_envs.push(item.env);
      $scope.used_envs = _.uniq($scope.used_envs);
      $scope.overview(item, false);
    }

    if (item.type === 'configuration') {
      $scope.current_custom.handler_configuration = item.name;
      $scope.current_custom.name = item.name;
      $scope.current_custom.env = item.env;

      _.forEach($scope.configurations.all, function(v) {
        v.class = '';
      });
      item.class = 'selected';
    }

    if (item.type === 'test') {
      var currently_selected = item.class === 'selected';
      if (currently_selected) {
        item.class = '';
        _.remove($scope.current_custom.tests, function(v) {
          return v.name === item.name;
        });
      } else {
        item.class = 'selected';
        $scope.current_custom.tests.push(item);
      }
    }

    if (item.type === 'applyCustom') {
      if (!$scope.current_custom.handler_configuration) {
        alert('A handler configuration should be selected');
        return;
      }
      if ($scope.current_custom.tests.length == 0) {
        alert('At least one test should be selected');
        return;
      }
      $scope.used_envs.push($scope.current_custom.env);
      $scope.used_envs = _.uniq($scope.used_envs);
      $scope.custom_suites.push($scope.current_custom);
      $scope.current_custom = {
        tests: []
      };
    }

    $scope.suites.available = _.filter($scope.suites.all, function(v) {
      return !_.contains($scope.used_envs, v.env);
    });
    $scope.configurations.available = _.filter($scope.configurations.all, function(v) {
      return !_.contains($scope.used_envs, v.env);
    });
    $scope.tests.available = _.filter($scope.tests.all, function(v) {
      return !_.any($scope.custom_suites, function(custom_suite) {
        return _.contains(custom_suite.tests, v);
      });
    });

    var descriptor_suites = _.map($scope.suites.selected, function(v) {
      return v.name
    });
    _.forEach($scope.custom_suites, function(v) {
      var tests = _.map(v.tests, function(v2) { return v2.name; }).join(',');
      var config = v.handler_configuration;
      descriptor_suites.push(tests + '@' + config);
    });

    $scope.descriptor = descriptor_suites.join('#');
  };

  var descriptor_overview = angular.element(document.getElementById('input_descriptor'));

  $scope.overview = function(item, show) {
    elem = angular.element(document.getElementById(item.type + '_' + item.name));
    if (show) {
      descriptor_overview.addClass('hidden');
      elem.removeClass('hidden');
    } else {
      elem.addClass('hidden');
    }
  };

  $scope.descriptorOverview = function() {
    descriptor_overview.toggleClass('hidden');
  };

  $scope.applyCustom = function() {
    $scope.calculate({type: 'applyCustom'});
  };

  $scope.loadSuitesYaml = function() {
    var suites_yaml_url = 'https://api.github.com/repos/cloudify-cosmo/cloudify-system-tests/contents/suites/suites/suites.yaml?ref=' + $scope.branch;

    $http.get(suites_yaml_url).then(function(response) {
        processSuitesYaml(response);
    }, function(error) {
      $log.error('Unable to fetch ' + suites_yaml_url);
    });
  };

  $scope.launchConfiguration = function() {
    var qb_rest_endpoint = 'http://192.168.9.18:8810/rest';
    var qb_config_path_to_config_id = qb_rest_endpoint + '/ids?configuration_path=' + $scope.configuration;

    $http.get(qb_config_path_to_config_id).then(function(response) {
      $log.info('requesting build for configuration id: ' + response.data);
      var coniguration_id = response.data;

      var request_xml = '' +
      '<com.pmease.quickbuild.BuildRequest>' +
        '<configurationId>' + coniguration_id + '</configurationId>' +
        '<respectBuildCondition>true</respectBuildCondition>' +
        '<variables>' +
          '<entry>' +
            '<string>system_tests_branch</string>' +
            '<string>' + $scope.branch + '</string>' +
          '</entry>' +
          '<entry>'+
            '<string>system_tests_descriptor</string>' +
            '<string>' + $scope.descriptor + '</string>' +
          '</entry>' +
        '</variables>' +
      '</com.pmease.quickbuild.BuildRequest>';

      var qb_build_request = qb_rest_endpoint + '/build_requests';
      $http.post(qb_build_request, {withCredentials: true, data: request_xml}).then(function (response) {
        $log.info(response.data);
        // TODO: redirect to build page in quickbuild
      }, function(error) {
        $log.error('Failed launching configuration ' + $scope.configuration);
      });
    }, function(error) {
      $log.error('Failed getting configuration id for ' + $scope.configuration);
    });
  };

  $scope.loadSuitesYaml();
}

(function() {
  angular.module("app", [])
    .controller("SystemTestsController", SystemTestsController)
    .directive('ngEnter', function() {
      return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
          if(event.which === 13) {
            scope.$apply(function(){
              scope.$eval(attrs.ngEnter, {'event': event});
            });
            event.preventDefault();
          }
        });
      };
    });
}());
