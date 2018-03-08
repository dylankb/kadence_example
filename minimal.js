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

console.log('Node info:\n');
console.log(`node routing table size: ${node.router.size}`)
console.log("node id: ", node.identity.toString('hex'))
console.log(`node's port: ${node.contact.port}`);

console.log('\notherNode info:\n');
console.log(`otherNode routing table size: ${otherNode.router.size}`)
console.log("otherNode id: ", otherNode.identity.toString('hex'))
console.log("otherNode port: ", otherNode.contact.port);

node.router.forEach(bucket => {
  if (bucket.head) {
    console.log("\nNode's routing table bucket contact:")
    console.log("bootstrap node id: ", bucket.keys().next().value.toString('hex'))
    console.log("bootstrap node: ", bucket.head)
  }
})

otherNode.router.forEach(bucket => {
  if (bucket.head) {
    console.log("\notherNode's routing table bucket contact:\n")
    console.log("node id: ", bucket.keys().next().value.toString('hex'))
    console.log("node: ", bucket.head)
  }
})
