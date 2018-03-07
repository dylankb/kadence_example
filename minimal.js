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

node.join([otherNode.identity, { // If we pass otherNode.identity.toString('hex'), it doesn't find
  hostname: 'localhost',        // otherNode, even though otherNode's string ID version is in fact
  port: 8081                   // equal to the return value of otherNode.identity.toString('hex')
}], () => {                     // Buffer.from(otherNode.identity.toString('hex'), 'hex').toString('hex') === otherNode.identity.toString('hex')


  // Add 'join' callback which indicates peers were discovered and
  // our node is now connected to the overlay network
  
  node.logger.info(`The nodes I know about: ${node.router.size}`)
  otherNode.logger.info(`The nodes I know about as otherNode: ${otherNode.router.size}`)

  node.router.forEach(bucket => {
    if (bucket.head) {
      console.log("\nNode information\n")
      console.log("node's id is ", node.identity.toString('hex'))
      console.log("node knows about: ", bucket.keys().next().value.toString('hex')) // should show the bucket with otherNode's id in it (will be a Buffer)
    }
  })


  otherNode.router.forEach(bucket => {
    if (bucket.head) {
      console.log("\nOtherNode information\n")
      console.log("OtherNode's ID is ", otherNode.identity.toString('hex'), "----- See, node knows about me")
      console.log("otherNode knows about: ", bucket.keys().next().value, " ----- but Idk about node") // Should show the bucket with node's id in it
    }
  }) 

  // node knows about otherNode but not vis versa
  // This is because node uses otherNode's ID to join the network
  // Which inserts otherNode's ID into the joining node's routing table
  

  // Base protocol exposes:
  // * node.iterativeFindNode(key, callback)
  // * node.iterativeFindValue(key, callback)
  // * node.iterativeStore(key, value, callback)
});



let contact = null;
node.router.forEach(bucket => {
  if (bucket.head) {
    contact = bucket.head
  }
})


contact[0] = contact[0].toString('hex')
console.log("\nContact information in node's bucket (contains otherNode's ID but not otherNode's contact info)")
console.log(contact)
console.log('\n')

console.log("What we should see in node's bucket instead (otherNode's ID plus otherNode's contact info)")
console.log([otherNode.identity.toString('hex'), otherNode.contact])
console.log("\n")


node.ping([otherNode.identity.toString('hex'), otherNode.contact], (error, latency) => { 
  console.log('successful ping?', error, latency)  // expected latency to be a number but it is an empty array...

})