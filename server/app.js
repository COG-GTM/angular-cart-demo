/**
 * Main application file
 */

'use strict';

import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import config from './config/environment';
import http from 'http';

// Connect to MongoDB
function onMongoError(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
}
mongoose.connect(config.mongo.uri, config.mongo.options).catch(onMongoError);
mongoose.connection.on('error', onMongoError);

// Populate databases with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // AngularJS 1.4 and Lodash 2.4 compile expressions with Function()
      'script-src': ["'self'", "'unsafe-eval'"],
      // Served over plain HTTP on the intranet; do not force https subresources
      'upgrade-insecure-requests': null
    }
  }
}));
var server = http.createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
function startServer() {
  server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
