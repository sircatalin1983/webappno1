'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';

var ItemSchema = new mongoose.Schema({
  title: String,
  completed: Boolean
});

registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
