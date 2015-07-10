'use strict';

(function() {

  var appConstants = {
    qbWebEndpoint: 'http://192.168.9.18:8810',
    qbRestEndpoint: 'http://192.168.41.175:9000/rest',
    suitesYAMLURLPrefix: 'https://api.github.com/repos/cloudify-cosmo/cloudify-system-tests/contents/suites/suites/suites.yaml?ref=',
    defaultQbConfiguration: 'root/cosmo/master/Tests/CoreSystemTests',
    defaultSuitesYAMLBranch: 'master'
  };

  angular
    .module('app', [
      'app.service.focus',
      'app.service.searcher',
      'app.service.descriptorBuilder',
      'app.service.suitesYAMLLoader',
      'app.service.suitesYAMLProcessor',
      'app.service.quickbuildLauncher',
      'app.directive.keys',
      'app.directive.items'])
    .value('appConstants', appConstants);
})();
