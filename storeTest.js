'use strict';


// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const crypto = require('crypto');

const getRandomKeyBuffer = function() {
  return crypto.randomBytes(160 / 8);
};

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

console.log('Node contacts in router', node.router.size);

// const nodeKey = getRandomKeyBuffer();
const byteValues = [163, 127, 17, 14, 100, 83, 221, 129, 205, 61, 198, 248, 20, 183, 6, 52, 86, 244, 103, 34];
const nodeKey = Buffer.from(byteValues)

// https://kadence.github.io/lib_node-kademlia.js.html
node.iterativeStore(nodeKey, {
  publisher: node.identity,
  timestamp: Date.now(),
  value: 'Test value',
}, (err, number) => {
  if (err) { console.log("Error!", err); }
  console.log('Number of nodes storing pair', number); // logs 0

  node.iterativeFindValue(nodeKey, (err, value, contacts) => {
    if (err) { console.log("Error!", err); }
    console.log('Found: ', value, ' in', contacts);
  });
});

// https://kadence.github.io/lib_node-kademlia.js.html
setTimeout(() => {
  console.log('\nAlso check after timeout');
  node.iterativeFindValue(nodeKey.toString('hex'), (err, value, contacts) => {
    if (err) { console.log("Error!", err); }
    console.log('Found: ', value, ' in', contacts);
  });
}, 1000);

// node.iterativeStore(nodeKey, {
//   publisher: node.identity,
//   timestamp: Date.now(),
//   value: 'True',
// }, (err, number) => {
//   setTimeout((err, number) => {
//   otherNode.storage.get(nodeKey, function(err, value) {
//     if (err) throw err                // throws error - key not found
//     console.log('otherNode=' + value)
//   }, 1000);
// });

// setTimeout(function() {
//   otherNode.storage.get(nodeKey, function(err, value) {
//     if (err) throw err // key not found
//
//     console.log('batNode=' + value);
//   });
// }, 1000);

// node.storage.put('batNode', 'true', function (err) {
//   if (err) throw err // I/O error
//   node.storage.get('batNode', function (err, value) {
//     if (err) throw err // key not found
//
//     console.log('batNode=' + value)
//   })
// })
