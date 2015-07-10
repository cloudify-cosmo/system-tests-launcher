'use strict';

angular.module('app')
  .controller('SystemTestsController', function(
        $http,
        $scope,
        $log,
        $timeout,
        appConstants,
        focus,
        searcher,
        descriptorBuilder,
        suitesYAMLLoader,
        suitesYAMLProcessor,
        quickbuildLauncher) {

    var resetSearch = function() {
      $scope.searchInput = '';
      $scope.searchInputListenerUnregister = null;
      $scope.searchResult = [];
      $scope.searchLabel = '';
      $scope.searchSelection = null;
      $scope.searchShown = false;
    };

    $scope.reset = function() {
      $scope.applyCustomDisabled = true;
      $scope.launchConfigurationDisabled = true;
      $scope.suites.selected = [];
      $scope.customSuites = [];
      $scope.descriptor = '';
      $scope.descriptorOverviewShown = false;
      $scope.currentCustom = {
        tests: []
      };
      $scope.currentCustomTests = '';
      if ($scope.configurations.all) {
        _.forEach($scope.configurations.all, function(v) {
          v.selected = false;
        });
      }
      if ($scope.tests.all) {
        _.forEach($scope.tests.all, function(v) {
          v.selected = false;
        });
      }
      resetSearch();
    };

    $scope.branch = appConstants.defaultSuitesYAMLBranch;
    $scope.configuration = appConstants.defaultQbConfiguration;
    $scope.configurations = {};
    $scope.tests = {};
    $scope.suites = {};
    $scope.reset();

    $scope.addCustomTests = function() {
      var allTestNames = _.map($scope.tests.all, function(v) { return v.name; });
      var tests;
      tests = _.uniq($scope.currentCustomTests.split(','));
      tests = _.filter(tests, function(test) {
        return !_.contains(allTestNames, test);
      });
      tests = _.map(tests, suitesYAMLProcessor.createTestObject);
      $scope.tests.all = $scope.tests.all.concat(tests);
      $scope.currentCustomTests = '';
      refresh();
    };

    $scope.calculate = function(item) {
      if (item.type === 'suite') {
        $scope.suites.selected.push(item);
        $scope.overview(item, false);
      } else if (item.type === 'configuration') {
        $scope.currentCustom.handlerConfiguration = item;
        _.forEach($scope.configurations.all, function(v) {
          v.selected = false;
        });
        item.selected = true;
      } else if (item.type === 'test') {
        if (item.selected) {
          item.selected = false;
          _.remove($scope.currentCustom.tests, function (v) {
            return v.name === item.name;
          });
        } else {
          item.selected = true;
          $scope.currentCustom.tests.push(item);
        }
      }
      refresh();
    };

    var refresh = function() {
      $scope.descriptor = descriptorBuilder.build($scope.suites.selected,
                                                  $scope.customSuites);
      $scope.applyCustomDisabled = $scope.currentCustom.tests.length === 0 ||
                                  !$scope.currentCustom.handlerConfiguration;
      $scope.launchConfigurationDisabled = $scope.branch.length === 0 ||
                                           $scope.descriptor.length === 0;
    };

    $scope.overview = function(item, show) {
      if (show) {
        $scope.descriptorOverviewShown = false;
        item.overviewShown = true;
      } else {
        item.overviewShown = false;
      }
    };
    $scope.descriptorOverview = function() {
      $scope.descriptorOverviewShown = !$scope.descriptorOverviewShown;
    };

    $scope.applyCustom = function() {
      if ($scope.applyCustomDisabled) {
        return;
      }
      $scope.customSuites.push($scope.currentCustom);
      $scope.overview($scope.currentCustom.handlerConfiguration, false);
      _.forEach($scope.currentCustom.tests, function(v) {
        $scope.overview(v, false);
      });
      $scope.currentCustom = {
        tests: []
      };
      refresh();
    };

    $scope.loadSuitesYAML = function() {
      var suitesYAMLURL = appConstants.suitesYAMLURLPrefix + $scope.branch;
      suitesYAMLLoader.load(suitesYAMLURL).then(processSuitesYAML);
    };

    var processSuitesYAML = function(suitesYAML) {
      var processed = suitesYAMLProcessor.process(suitesYAML);
      $scope.configurations.all = processed.configurations;
      $scope.tests.all = processed.tests;
      $scope.suites.all = processed.suites;
      $scope.reset();
    };

    $scope.launchConfiguration = function() {
      if ($scope.launchConfigurationDisabled) {
        return;
      }
      quickbuildLauncher.launch(
        appConstants.qbWebEndpoint,
        appConstants.qbRestEndpoint,
        $scope.configuration,
        $scope.branch,
        $scope.descriptor);
    };

    $scope.loadSuitesYAML();

    $scope.loseFocus = function() {
      focus('descriptor', true);
    };

    $scope.startSearch = function(items, searchLabel) {
      $scope.searcher = searcher.newSearcher(items);
      $scope.searchLabel = searchLabel;
      $scope.searchShown = true;
      $scope.searchInput = '';
      if ($scope.searchInputListenerUnregister) {
        $scope.searchInputListenerUnregister();
      }
      $scope.searchInputListenerUnregister = $scope.$watch('searchInput', function() {
        $scope.searchResult = $scope.searcher.search($scope.searchInput);
        if ($scope.searchResult.length > 0) {
          $scope.searchSelection = $scope.searchResult[0];
        }
      });
      $timeout(function() {
        focus('search_input');
      });
    };

    $scope.endSearch = function(calculate) {
      if (calculate && $scope.searchSelection) {
        $scope.calculate($scope.searchSelection);
      }
      $scope.searchInputListenerUnregister();
      resetSearch();
    };

  });
