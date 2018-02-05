'use strict';

describe('Component: ListsComponent', function() {
  // load the controller's module
  beforeEach(module('webappno1App.lists'));

  var ListsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ListsComponent = $componentController('lists', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
