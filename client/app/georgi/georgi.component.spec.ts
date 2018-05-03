'use strict';

describe('Component: GeorgiComponent', function() {
  // load the controller's module
  beforeEach(module('webappno1App.georgi'));

  var GeorgiComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    GeorgiComponent = $componentController('georgi', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
