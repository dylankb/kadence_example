'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');

const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1337 }
});

node.listen(1337);

// otherNode - setup and join network via node
const otherNode = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./otherdb'))),
  contact: { hostname: 'localhost', port: 1338}
})

otherNode.listen(1338)

otherNode.join([node.identity, node.contact], () => {
});

// node should have no contacts at this point
console.log(`node router size - pre-ping: ${node.router.size}`);

// Example using async.series to ensure this isn't an async problem
// https://caolan.github.io/async/docs.html#series
async.series([
  function(callback) {
    node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
      console.log('ping successful?', error, latency)
    })
    callback();
    // otherNode received a message from node, therefore their mutual routing tables should have updated:
    // https://kadence.github.io/KademliaRules.html
  },
  function(callback) {
    console.log(`node router size - post-ping: ${node.router.size}`);
    node.router.forEach(bucket => {
      bucket.forEach(contact => {
        console.log('Post ping contacts?', contact);
      })
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
