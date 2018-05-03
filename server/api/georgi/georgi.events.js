/**
 * Georgi model events
 */

'use strict';

import {EventEmitter} from 'events';
var GeorgiEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
GeorgiEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Georgi) {
  for(var e in events) {
    let event = events[e];
    Georgi.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    GeorgiEvents.emit(event + ':' + doc._id, doc);
    GeorgiEvents.emit(event, doc);
  };
}

export {registerEvents};
export default GeorgiEvents;
