'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var itemCtrlStub = {
  index: 'itemCtrl.index',
  show: 'itemCtrl.show',
  create: 'itemCtrl.create',
  upsert: 'itemCtrl.upsert',
  patch: 'itemCtrl.patch',
  destroy: 'itemCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var itemIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './item.controller': itemCtrlStub
});

describe('Item API Router:', function() {
  it('should return an express router instance', function() {
    itemIndex.should.equal(routerStub);
  });

  describe('GET /api/items', function() {
    it('should route to item.controller.index', function() {
      routerStub.get
        .withArgs('/', 'itemCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/items/:id', function() {
    it('should route to item.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'itemCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/items', function() {
    it('should route to item.controller.create', function() {
      routerStub.post
        .withArgs('/', 'itemCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/items/:id', function() {
    it('should route to item.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'itemCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/items/:id', function() {
    it('should route to item.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'itemCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/items/:id', function() {
    it('should route to item.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'itemCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
