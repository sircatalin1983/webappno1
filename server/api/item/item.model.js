'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';

var ItemSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  idList: String
});

registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
