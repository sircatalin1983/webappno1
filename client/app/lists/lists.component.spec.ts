'use strict';

describe('Component: ListsComponent', function() {
  // load the controller's module
  //beforeEach(module('webappno1App.lists'));

  var ListsComponent;

  // Initialize the controller and a mock scope
  //beforeEach(inject(function($componentController) {
  //  ListsComponent = $componentController('lists', {});
  //}));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});

describe("A test scenario", function() {
  it("is just a function, so it can contain any code", function() {
    var foo = 0;
    foo += 1;

    expect(foo).toEqual(1);
  });

  it("can have more than one expectation", function() {
    var foo = 0;
    foo += 1;

    expect(foo).toEqual(1);
    expect(true).toEqual(true);
  });
});

