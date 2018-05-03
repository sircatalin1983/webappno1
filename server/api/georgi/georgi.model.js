'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './georgi.events';

var GeorgiSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(GeorgiSchema);
export default mongoose.model('Georgi', GeorgiSchema);
