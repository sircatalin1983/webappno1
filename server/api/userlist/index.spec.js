'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var userlistCtrlStub = {
  index: 'userlistCtrl.index',
  show: 'userlistCtrl.show',
  create: 'userlistCtrl.create',
  upsert: 'userlistCtrl.upsert',
  patch: 'userlistCtrl.patch',
  destroy: 'userlistCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var userlistIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './userlist.controller': userlistCtrlStub
});

describe('Userlist API Router:', function() {
  it('should return an express router instance', function() {
    userlistIndex.should.equal(routerStub);
  });

  describe('GET /api/userlists', function() {
    it('should route to userlist.controller.index', function() {
      routerStub.get
        .withArgs('/', 'userlistCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/userlists/:id', function() {
    it('should route to userlist.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'userlistCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/userlists', function() {
    it('should route to userlist.controller.create', function() {
      routerStub.post
        .withArgs('/', 'userlistCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/userlists/:id', function() {
    it('should route to userlist.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'userlistCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/userlists/:id', function() {
    it('should route to userlist.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'userlistCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/userlists/:id', function() {
    it('should route to userlist.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'userlistCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
