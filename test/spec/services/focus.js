'use strict';

describe('Service: focus', function () {

  var _focus, timeout, element;

  beforeEach(module('app.service.focus'));
  beforeEach(inject(function ($rootScope, $timeout, focus) {
    element = document.createElement('input');
    element.id = 'generated_id';
    document.body.appendChild(element);
    timeout = $timeout;
    _focus = focus;
  }));

  afterEach(function() {
    document.body.removeChild(element);
  });

  it('should focus element denoted by id', function () {
    _focus(element.id);
    timeout.flush();
    expect(document.activeElement.id).toEqual(element.id);
  });

  it('should blur element denoted by id if passed true as the ' +
     'second argument', function () {
    _focus(element.id, true);
    timeout.flush();
    expect(document.activeElement.id).toEqual(document.body.id);
  });

});
