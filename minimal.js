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

const otherNode = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1338}
})

otherNode.listen(1338)

otherNode.join(['ea48d3f07a5241291ed0b4cab6483fa8b8fcc127', {
  hostname: 'localhost',
  port: 8080
}], () => {
  otherNode.logger.info(`${otherNode.identity} is my id`)
})

const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1337 }
});

// When you are ready, start listening for messages and join the network
// The Node#listen method takes different arguments based on the transport
// adapter being used
node.listen(1337);

// otherNode.identity is a Buffer, so you will see it logged as a Buffer below.
// This is okay, though, because when a string is passed into node.join, it is converted a Buffer
// if it isn't already a buffer
node.join([otherNode.identity, {
  hostname: 'localhost',
  port: 8080
}], () => {
  // Add 'join' callback which indicates peers were discovered and
  // our node is now connected to the overlay network
  
  node.logger.info(`The nodes I know about: ${node.router.size}`)
  otherNode.logger.info(`The nodes I know about as otherNode: ${otherNode.router.size}`)

  node.router.forEach(bucket => {
    if (bucket.head) {
      console.log("node knows about: ", bucket) // should show the bucket with otherNode's id in it (will be a Buffer)
    }
  })

  otherNode.router.forEach(bucket => {
    if (bucket.head) {
      console.log("otherNode knows about: ", bucket) // Should show the bucket with node's id in it
    }
  }) 
  // Base protocol exposes:
  // * node.iterativeFindNode(key, callback)
  // * node.iterativeFindValue(key, callback)
  // * node.iterativeStore(key, value, callback)
});
