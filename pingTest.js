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

// node should have no contacts at this point prior to the ping
console.log(`node router size - pre-ping: ${node.router.size}`);

// Once the ping happens, otherNode will receive a message from node, and their
// mutual routing tables should update. https://kadence.github.io/KademliaRules.html
// A way to test this to see if node now has any contacts in the routing table:

// Doesn't work. First attempt - test in ping callback.

// node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//   console.log('ping successful?', error, latency)
//   console.log(`node router size - post-ping: ${node.router.size}`); // 0
//   node.router.forEach(bucket => {
//     bucket.forEach(contact => {
//       console.log('Post ping contact: ', contact);
//     });
//   });
// });

// Does not currently work. async#series.
// https://caolan.github.io/async/docs.html#series

// async.series([
//   function(callback) {
//     node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//       callback();
//       console.log('ping successful?', error, latency)
//     })
//   },
//   function(callback) {
//     console.log(`node router size - post-ping: ${node.router.size}`); // 0
//     node.router.forEach(bucket => {
//       bucket.forEach(contact => {
//         console.log('Post ping contacts?', contact);
//       })
//     })
//   }]
// )

// This works. After setTimeout router has a contact.

// node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//   console.log('ping successful?', error, latency)
//   setTimeout(function() {
//     console.log(`node router size - post-ping: ${node.router.size}`);
//     node.router.forEach(bucket => {
//       bucket.forEach(contact => {
//         console.log('Post ping contacts?', contact);
//       })
//     })
//   }, 1000)
// })

// Doesn't work. async / await

// async function testPing(node) {
//   let promise = new Promise ((resolve, reject) => {
//     node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//       resolve(node);
//       console.log('ping successful?', error, latency)
//     });
//   });
//
//   let updatedNode = await promise;
//   console.log(`node router size - post-ping: ${node.router.size}`); // 0
//   updatedNode.router.forEach(bucket => {
//     bucket.forEach(contact => {
//       console.log('Post ping contacts?', contact);
//     })
//   });
// }
//
// testPing(node);

// Doesn't work. Vanilla JS promise

// var promise = new Promise(function(resolve, reject) {
//   node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//     console.log('ping successful?', error, latency)
//   })
//   resolve(node);
// });
// promise.then(function(node) {
//   console.log('promise param function body');
  // node.router.forEach(bucket => {
  //   bucket.forEach(contact => {
  //     console.log('Post ping contacts?', contact);
  //   })
//   })

// Doesn't work. Promise.resolve

// const pingFunc = node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => {
//   console.log('ping successful?', error, latency)
// })
// const promise = Promise.resolve(pingFunc)
//
// promise.then(function() {
//   console.log('then param function body');
  // node.router.forEach(bucket => {
  //   bucket.forEach(contact => {
  //     console.log('Post ping contacts?', contact);
  //   })
  // })
// })

// Psuedo-code notes from the kademlia paper

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

// Pseudo-code for what happens when PING RPC is issued

// AbstractNode initialized, add _process as an event handler to on ‘data’ event. https://github.com/kadence/kadence/blob/master/lib/node-abstract.js#L146
// RPC occurs which fires ‘data’ event (haven't confirmed where)
// _updateContact called in _proccess https://github.com/kadence/kadence/blob/master/lib/node-kademlia.js#L426
// _updateContact pushes contact to _updateContactQueue
// _updateContact queue is queue object created in KademliaNode constructor https://github.com/kadence/kadence/blob/master/lib/node-kademlia.js#L35-L38
// _updateContactQueue passes contact info to _updateContactWorked
// _updateContactWorked updates contact in a routing table bucket https://github.com/kadence/kadence/blob/master/lib/node-kademlia.js#L439
