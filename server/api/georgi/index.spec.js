'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var georgiCtrlStub = {
  index: 'georgiCtrl.index',
  show: 'georgiCtrl.show',
  create: 'georgiCtrl.create',
  upsert: 'georgiCtrl.upsert',
  patch: 'georgiCtrl.patch',
  destroy: 'georgiCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var georgiIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './georgi.controller': georgiCtrlStub
});

describe('Georgi API Router:', function() {
  it('should return an express router instance', function() {
    georgiIndex.should.equal(routerStub);
  });

  describe('GET /api/georgis', function() {
    it('should route to georgi.controller.index', function() {
      routerStub.get
        .withArgs('/', 'georgiCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/georgis/:id', function() {
    it('should route to georgi.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'georgiCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/georgis', function() {
    it('should route to georgi.controller.create', function() {
      routerStub.post
        .withArgs('/', 'georgiCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/georgis/:id', function() {
    it('should route to georgi.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'georgiCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/georgis/:id', function() {
    it('should route to georgi.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'georgiCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/georgis/:id', function() {
    it('should route to georgi.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'georgiCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
