'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newGeorgi;

describe('Georgi API:', function() {
  describe('GET /api/georgis', function() {
    var georgis;

    beforeEach(function(done) {
      request(app)
        .get('/api/georgis')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          georgis = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      georgis.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/georgis', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/georgis')
        .send({
          name: 'New Georgi',
          info: 'This is the brand new georgi!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newGeorgi = res.body;
          done();
        });
    });

    it('should respond with the newly created georgi', function() {
      newGeorgi.name.should.equal('New Georgi');
      newGeorgi.info.should.equal('This is the brand new georgi!!!');
    });
  });

  describe('GET /api/georgis/:id', function() {
    var georgi;

    beforeEach(function(done) {
      request(app)
        .get(`/api/georgis/${newGeorgi._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          georgi = res.body;
          done();
        });
    });

    afterEach(function() {
      georgi = {};
    });

    it('should respond with the requested georgi', function() {
      georgi.name.should.equal('New Georgi');
      georgi.info.should.equal('This is the brand new georgi!!!');
    });
  });

  describe('PUT /api/georgis/:id', function() {
    var updatedGeorgi;

    beforeEach(function(done) {
      request(app)
        .put(`/api/georgis/${newGeorgi._id}`)
        .send({
          name: 'Updated Georgi',
          info: 'This is the updated georgi!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedGeorgi = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedGeorgi = {};
    });

    it('should respond with the updated georgi', function() {
      updatedGeorgi.name.should.equal('Updated Georgi');
      updatedGeorgi.info.should.equal('This is the updated georgi!!!');
    });

    it('should respond with the updated georgi on a subsequent GET', function(done) {
      request(app)
        .get(`/api/georgis/${newGeorgi._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let georgi = res.body;

          georgi.name.should.equal('Updated Georgi');
          georgi.info.should.equal('This is the updated georgi!!!');

          done();
        });
    });
  });

  describe('PATCH /api/georgis/:id', function() {
    var patchedGeorgi;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/georgis/${newGeorgi._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Georgi' },
          { op: 'replace', path: '/info', value: 'This is the patched georgi!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedGeorgi = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedGeorgi = {};
    });

    it('should respond with the patched georgi', function() {
      patchedGeorgi.name.should.equal('Patched Georgi');
      patchedGeorgi.info.should.equal('This is the patched georgi!!!');
    });
  });

  describe('DELETE /api/georgis/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/georgis/${newGeorgi._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when georgi does not exist', function(done) {
      request(app)
        .delete(`/api/georgis/${newGeorgi._id}`)
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
