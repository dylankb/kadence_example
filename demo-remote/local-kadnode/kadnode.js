'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');
const traverse = require('@kadenceproject/kadence/')
const seedInfo = require('./../seedInfo').seedInfo;

const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./db'))),
  contact: { hostname: 'localhost', port: 1338 }
});

console.log(`node router size - pre-ping: ${node.router.size}`); // 0
node.ping([seedInfo.identity, seedInfo.contact], (error, latency) => {
  console.log('ping successful?', error, latency)
  setTimeout(function() {
    console.log(`node router size - post-ping: ${node.router.size}`);
    node.router.forEach(bucket => {
      bucket.forEach(contact => {
        debugger;
        console.log('Post ping contact: ', contact);
      });
    });
  }, 2000);
});

// Don't need to listen yet
// node.listen(1338);
