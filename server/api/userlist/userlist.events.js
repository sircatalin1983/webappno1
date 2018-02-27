/**
 * Userlist model events
 */

'use strict';

import {EventEmitter} from 'events';
var UserListEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserListEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(UserList) {
  for(var e in events) {
    let event = events[e];
    UserList.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    UserListEvents.emit(event + ':' + doc._id, doc);
    UserListEvents.emit(event, doc);
  };
}

export {registerEvents};
export default UserListEvents;
