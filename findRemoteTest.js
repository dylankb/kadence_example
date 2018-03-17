'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');
const traverse = require('@kadenceproject/kadence/')

const seedInfo = {
  identity: '0000000000000000000000000000000000000000',
  contact: { hostname: 'https://kadence-test.appspot.com', port: 1337 }
};

const otherNode = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1338 }
});

const otherNode.join([seedInfo.identity, seedInfo.contact], () => {});

otherNode.ping([seedInfo.identity.toString('hex'), seedInfo.contact], (error, latency) => {
  console.log('ping successful?', error, latency)
  console.log(`node router size - post-ping: ${node.router.size}`); // 0
  otherNode.router.forEach(bucket => {
    bucket.forEach(contact => {
      console.log('Post ping contact: ', contact);
    });
  });
});

// https://kadence-test.appspot.com
