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

// node joined via bootstrap node, so there should only be one contact at head

node.router.forEach(bucket => {
  if (bucket.head) {
    console.log("\nNode's routing table bucket contact:")
    console.log("bootstrap node id: ", bucket.keys().next().value.toString('hex'))
    console.log("bootstrap node: ", bucket.head)
  }
})

// otherNode received a message from node, therefore their mutual routing tables should have updated:

node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
  console.log('ping successful?', error, latency)
})

// otherNode received a message from node, therefore their mutual routing tables should have updated:
// https://kadence.github.io/KademliaRules.html

node.router.forEach(bucket => {
  if (bucket.head) {
    console.log("\nNode's routing table bucket contact - post ping:")
    console.log("bootstrap node is still head: ", bucket.head)
    console.log("tail should now be node: ", bucket.tail)
  }
})

// Also more explicit psuedo-code notes from the kademlia paper

// if (nodeInBucket) { move sending node to tail of the k-bucket/list }
// else if (!nodeInBucket && bucketHasSpace) { insert sending node at tail }
// else if (!bucketHasSpace) {
//   response = PING(bucket.head) // ping least-recently seen node
//   if (response) {
//     evict least recently seen node, add sending node to tail
//   } else {
//     move least recently seen node to tail, discard sending
