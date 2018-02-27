'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';

var ItemSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  idList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }
});

registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
