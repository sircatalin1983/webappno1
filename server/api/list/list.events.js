/**
 * List model events
 */

'use strict';

import {EventEmitter} from 'events';
var ListEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ListEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(List) {
  for(var e in events) {
    let event = events[e];
    List.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    ListEvents.emit(event + ':' + doc._id, doc);
    ListEvents.emit(event, doc);
  };
}

export {registerEvents};
export default ListEvents;
