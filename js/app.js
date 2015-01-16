function SystemTestsController($http, $scope, $timeout, $log) {

  $scope.branch = 'master';

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
  };

  function processSuitesYaml(response) {
    if (response.data.content) {
      raw_suites_yaml = Base64.decode(response.data.content);
    } else {
      raw_suites_yaml = response.data;
    }
    suites_yaml = jsyaml.load(raw_suites_yaml);

    $scope.configurations.all = _.map(toList(suites_yaml.handler_configurations), function(v) {
      env = v.env || v.handler;
      v.env = env;
      v.type = 'configuration';
      v.class = '';
      return v;
    });
    $scope.tests.all = _.map(toList(suites_yaml.tests), function(v) {
      v.type = 'test';
      v.class = '';
      return v;
    });
    $scope.suites.all = _.map(toList(suites_yaml.test_suites), function(v) {
      handler_configuration = suites_yaml.handler_configurations[v.handler_configuration];
      v.env = handler_configuration.env;
      v.type = 'suite';
      return v;
    });

    $scope.reset();
  }

  $scope.addCustomTests = function() {
    tests = $scope.current_custom_tests.split(',');
    tests = _.map(tests, function(v) {
      return {name: v, 'class': '', tests: [v], type: 'test' };
    });
    $scope.tests.all = $scope.tests.all.concat(tests);
    $scope.current_custom_tests = '';
    $scope.calculate({});
  }

  $scope.calculate = function(item) {
    if (item.type === 'suite') {
      $scope.suites.selected.push(item);
      $scope.used_envs.push(item.env);
      $scope.used_envs = _.uniq($scope.used_envs);
    }

    if (item.type === 'configuration') {
      $scope.current_custom.configuration = item;
      $scope.current_custom.env = item.env;

      _.forEach($scope.configurations.all, function(v) {
        v.class = '';
      });
      item.class = 'selected';
    }

    if (item.type === 'test') {
      currently_selected = item.class === 'selected';
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
      if (!$scope.current_custom.configuration) {
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

    descripor_suites = _.map($scope.suites.selected, function(v) {
      return v.name
    });
    _.forEach($scope.custom_suites, function(v) {
      tests = _.map(v.tests, function(v2) { return v2.name; }).join(',');
      config = v.configuration.name;
      descripor_suites.push(tests + '@' + config);
    });

    $scope.descriptor = descripor_suites.join('#');
  }

  $scope.applyCustom = function() {
    $scope.calculate({type: 'applyCustom'});
  };

  $scope.reloadSuitesYaml = function() {
    loadSuitesYaml();
  };

  loadSuitesYaml = function() {
    suites_yaml_url = 'suites.yaml';
    suites_yaml_url = 'https://api.github.com/repos/cloudify-cosmo/cloudify-system-tests/contents/suites/suites/suites.yaml?ref=' + $scope.branch;

    $http.get(suites_yaml_url).then(function(response) {
        processSuitesYaml(response);
    }, function(error) {
      $log.error('unable to fetch suites.yaml');
    });
  }

  loadSuitesYaml();
};

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
