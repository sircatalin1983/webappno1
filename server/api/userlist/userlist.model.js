'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './userlist.events';

var UserListSchema = new mongoose.Schema({
  idUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  idList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
  role: {
    type: String,
    default: 'user' //the other is owner
  }
});

registerEvents(UserListSchema);
export default mongoose.model('UserList', UserListSchema);
