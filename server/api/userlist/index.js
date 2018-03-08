'use strict';

var express = require('express');
var controller = require('./userlist.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:idUser/items', controller.showLists);
router.get('/:idList/users', controller.showUsers);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:idList/items', controller.destroyList);
router.delete('/:idUser', controller.deleteUserListByIdUser);
router.delete('/:id', controller.destroy);

module.exports = router;
