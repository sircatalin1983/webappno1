'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './item.events';

var ItemSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(ItemSchema);
export default mongoose.model('Item', ItemSchema);
