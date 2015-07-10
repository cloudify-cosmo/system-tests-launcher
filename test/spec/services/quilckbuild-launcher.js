'use strict';

describe('Service: quickbuildLauncher', function () {

  var launcher, http, $window;
  var webEndpoint = 'http://web.endpoint';
  var restEndpoint = 'http://rest.endpoint';
  var configuration = 'test/configuration/path';
  var configurationID = '123';
  var branch = 'test-branch';
  var descriptor = 'test#descriptor';

  beforeEach(module('app.service.quickbuildLauncher'));
  beforeEach(function() {
    $window = {location: { assign: jasmine.createSpy()} };
    module(function($provide) {
      $provide.value('$window', $window);
    });
    inject(function ($httpBackend, quickbuildLauncher) {
      http = $httpBackend;
      launcher = quickbuildLauncher;
    });
  });


  it('should contain a launch function', function () {
    expect(launcher.launch).toBeDefined();
  });

  it('should first make a rest call to get the configuration id', function() {
    http.expectGET(restEndpoint + '/ids?configuration_path=' + configuration).respond(400);
    launcher.launch(webEndpoint, restEndpoint, configuration, branch, descriptor);
    http.flush();
  });

  it('should then make a rest call to execute the build and redirect' +
     ' to overview page', function() {
    http.expectGET(restEndpoint + '/ids?configuration_path=' + configuration).respond(
      200, configurationID);

    http.expectPOST(restEndpoint + '/build_requests', function(data) {
      return _.all([configurationID, branch, descriptor], function(v) {
        return data.indexOf(v) >= 0;
      });
    }).respond(201, configurationID);

    launcher.launch(webEndpoint, restEndpoint, configuration, branch, descriptor);
    http.flush();
    expect($window.location.assign).toHaveBeenCalledWith(
      webEndpoint + '/overview/' + configurationID);
  });
});
