'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');

const seedNode = kad({
  identity: 'ea48d3f07a5241291ed0b4cab6483fa8b8fcc127',
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./seeddb'))),
  contact: { hostname: 'localhost', port: 8080 }
});

seedNode.listen(8080);

// A4DFC... JOINS seedNode's routing table. That's why it was always in seedNode's
// routing table :)
seedNode.join(['A4DFCD6A5BCE877899728CC65CCC9C49FC35B81C', {
  hostname: 'localhost',
  port: 1001
}], () => {})

// node - setup and join network via seedNode
const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1337 }
});

node.listen(1337);
// node JOINS seedNode's routing table
seedNode.join([node.identity, node.contact])

// otherNode - setup and join network via seedNode
const otherNode = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./otherdb'))),
  contact: { hostname: 'localhost', port: 1338 }
});

otherNode.listen(1338);
seedNode.join([otherNode.identity, otherNode.contact])

console.log(`seedNode connected to ${seedNode.router.size} peers!`); // should be 3
console.log("seedNode's routing table bucket contacts:")
seedNode.router.forEach(bucket => {
  if (bucket.head) {
    bucket.forEach(contact => {
      console.log(contact); // 'Logs out all nodes that joined its routing table'
    });
  }
})
