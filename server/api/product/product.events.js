/**
 * Product model events
 */

'use strict';

import {EventEmitter} from 'events';
var ProductEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ProductEvents.setMaxListeners(0);

// Register the event emitter to the model events. Must run before the model is
// compiled (Mongoose ignores hooks added later); deleteOne replaced remove().
ProductEvents.registerHooks = function(schema) {
  schema.post('save', emitEvent('save'));
  schema.post('deleteOne', {document: true, query: false}, emitEvent('remove'));
};

function emitEvent(event) {
  return function(doc) {
    ProductEvents.emit(event + ':' + doc._id, doc);
    ProductEvents.emit(event, doc);
  }
}

export default ProductEvents;
