'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');

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
  storage: levelup(encoding(leveldown('./otherdb'))),
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
// https://kadence.github.io/KademliaRules.html

// Example using async.series to ensure this isn't an async problem
// https://caolan.github.io/async/docs.html#series

async.series([
  function(callback) {
    node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
      console.log('ping successful?', error, latency)
    })
    callback();
  },
  function(callback) {
    node.router.forEach(bucket => {
      if (bucket.head) {
        console.log("\nNode's routing table bucket contact - post ping:")
        console.log("bootstrap node is still head: ", bucket.head)
        console.log("tail should now be node: ", bucket.tail)
        callback();
      }
    })
  }]
)

// Also more explicit psuedo-code notes from the kademlia paper

// if (nodeInBucket) { move sending node to tail of the k-bucket/list }
// else if (!nodeInBucket && bucketHasSpace) { insert sending node at tail } - this isn't happening
// else if (!bucketHasSpace) {
//   response = PING(bucket.head) // ping least-recently seen node
//   if (response) {
//     move least recently seen node to tail, discard sending               - this seems to be happening
//   } else {
//     evict least recently seen node, add sending node to tail

// If none of the above made sense, basically if node pings otherNode, node should
// now be in one of otherNodes’ buckets.
// If node was added to an otherNode bucket that already has a head, then it should
// be the bucket’s new tail
