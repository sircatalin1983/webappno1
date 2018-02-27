'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newUserlist;

describe('Userlist API:', function() {
  describe('GET /api/userlists', function() {
    var userlists;

    beforeEach(function(done) {
      request(app)
        .get('/api/userlists')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          userlists = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      userlists.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/userlists', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/userlists')
        .send({
          name: 'New Userlist',
          info: 'This is the brand new userlist!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newUserlist = res.body;
          done();
        });
    });

    it('should respond with the newly created userlist', function() {
      newUserlist.name.should.equal('New Userlist');
      newUserlist.info.should.equal('This is the brand new userlist!!!');
    });
  });

  describe('GET /api/userlists/:id', function() {
    var userlist;

    beforeEach(function(done) {
      request(app)
        .get(`/api/userlists/${newUserlist._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          userlist = res.body;
          done();
        });
    });

    afterEach(function() {
      userlist = {};
    });

    it('should respond with the requested userlist', function() {
      userlist.name.should.equal('New Userlist');
      userlist.info.should.equal('This is the brand new userlist!!!');
    });
  });

  describe('PUT /api/userlists/:id', function() {
    var updatedUserlist;

    beforeEach(function(done) {
      request(app)
        .put(`/api/userlists/${newUserlist._id}`)
        .send({
          name: 'Updated Userlist',
          info: 'This is the updated userlist!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedUserlist = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedUserlist = {};
    });

    it('should respond with the updated userlist', function() {
      updatedUserlist.name.should.equal('Updated Userlist');
      updatedUserlist.info.should.equal('This is the updated userlist!!!');
    });

    it('should respond with the updated userlist on a subsequent GET', function(done) {
      request(app)
        .get(`/api/userlists/${newUserlist._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let userlist = res.body;

          userlist.name.should.equal('Updated Userlist');
          userlist.info.should.equal('This is the updated userlist!!!');

          done();
        });
    });
  });

  describe('PATCH /api/userlists/:id', function() {
    var patchedUserlist;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/userlists/${newUserlist._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Userlist' },
          { op: 'replace', path: '/info', value: 'This is the patched userlist!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedUserlist = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedUserlist = {};
    });

    it('should respond with the patched userlist', function() {
      patchedUserlist.name.should.equal('Patched Userlist');
      patchedUserlist.info.should.equal('This is the patched userlist!!!');
    });
  });

  describe('DELETE /api/userlists/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/userlists/${newUserlist._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when userlist does not exist', function(done) {
      request(app)
        .delete(`/api/userlists/${newUserlist._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
