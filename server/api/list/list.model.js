'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './list.events';

var ListSchema = new mongoose.Schema({
  name: String,
  info: String,
  owner: String,
  active: Boolean
});

registerEvents(ListSchema);
export default mongoose.model('List', ListSchema);
