'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var listCtrlStub = {
  index: 'listCtrl.index',
  show: 'listCtrl.show',
  create: 'listCtrl.create',
  upsert: 'listCtrl.upsert',
  patch: 'listCtrl.patch',
  destroy: 'listCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var listIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './list.controller': listCtrlStub
});

describe('List API Router:', function() {
  it('should return an express router instance', function() {
    listIndex.should.equal(routerStub);
  });

  describe('GET /api/lists', function() {
    it('should route to list.controller.index', function() {
      routerStub.get
        .withArgs('/', 'listCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/lists/:id', function() {
    it('should route to list.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'listCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/lists', function() {
    it('should route to list.controller.create', function() {
      routerStub.post
        .withArgs('/', 'listCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/lists/:id', function() {
    it('should route to list.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'listCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/lists/:id', function() {
    it('should route to list.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'listCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/lists/:id', function() {
    it('should route to list.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'listCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
