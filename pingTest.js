/**
 * @example kad/example/minimal
 */

'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');

// Construct a kademlia node interface; the returned `Node` object exposes:
// - router
// - rpc
// - storage
// - identity

// node - setup and join network via "bootstrap" node

const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1337 }
});

// When you are ready, start listening for messages and join the network
// The Node#listen method takes different arguments based on the transport
// adapter being used
node.listen(1337);

node.join(['ea48d3f07a5241291ed0b4cab6483fa8b8fcc127', {
  hostname: 'localhost',
  port: 8080
}], () => {
  // Base protocol exposes:
  // * node.iterativeFindNode(key, callback)
  // * node.iterativeFindValue(key, callback)
  // * node.iterativeStore(key, value, callback)
})

// otherNode - setup and join network via node

const otherNode = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1338}
})

otherNode.listen(1338)

otherNode.join([node.identity, node.contact], () => {
});

// If you uncomment this, I don't see anything different in the console so I
// can't tell if it's working. Ping may not be set up to log to the console, though.

// node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//   console.log('ping successful?', error, latency)
// })
