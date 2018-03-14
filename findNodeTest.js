'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');

const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1337 }
});

node.listen(1337);

const otherNode = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./otherdb'))),
  contact: { hostname: 'localhost', port: 1338}
});
otherNode.listen(1338)

// node joins otherNodes routing table
node.join([otherNode.identity, otherNode.contact], () => {});

node.iterativeFindNode(node.identity, (err, contacts) => {
  console.log("Node router size", node.router.size);
  if (err) { console.log("Error!", err); }
  console.log('Returned contacts: ', contacts);

  setTimeout(() => {
    console.log('\nAlso check after timeout');
    if (err) { console.log("Error!", err); }
    console.log('Returned contacts:', contacts);
  }, 1000);
});
