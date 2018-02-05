'use strict';

describe('Component: AbcComponent', function() {
  // load the controller's module
  beforeEach(module('webappno1App.abc'));

  var AbcComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    AbcComponent = $componentController('abc', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
