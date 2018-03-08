/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/userlists              ->  index
 * POST    /api/userlists              ->  create
 * GET     /api/userlists/:id          ->  show
 * PUT     /api/userlists/:id          ->  upsert
 * PATCH   /api/userlists/:id          ->  patch
 * DELETE  /api/userlists/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import UserList from './userlist.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Userlists
export function index(req, res) {
  return UserList.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Userlist from the DB
export function show(req, res) {
  return UserList.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Userlist from the DB by role
export function showLists(req, res) {
  return UserList.find({
    idUser : req.params.idUser
  })
  .select ( { idUser : 1, idList : 1, role : 1} )
  .exec()
  .then(respondWithResult(res))
  .catch(handleError(res));
}

// Creates a new Userlist in the DB
export function create(req, res) {
  return UserList.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Userlist in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return UserList.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Userlist in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return UserList.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Userlist from the DB
export function destroy(req, res) {
  return UserList.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Gets a single Userlist from the DB by role
export function showUsers(req, res) {
  return UserList.find({
    idList : req.params.idList
  })
  .select ( { idUser : 1, idList : 1, role : 1} )
  .exec()
  .then(respondWithResult(res))
  .catch(handleError(res));
}

// Deletes a Userlist from the DB by idList
export function destroyList(req, res) {
  return UserList.deleteMany({ idList: req.params.idList }).exec()
    .then(handleEntityNotFound(res))
    .catch(handleError(res));
}

export function deleteUserListByIdUser(req, res) {
  return UserList.deleteMany({ idUser: req.params.idUser }).exec()
    .then(handleEntityNotFound(res))
    .catch(handleError(res));
}
