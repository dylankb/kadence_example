'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');
const traverse = require('@kadenceproject/kadence/')

const node = kad({
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./mydb'))),
  contact: { hostname: 'localhost', port: 1338 }
});

node.traverse = node.plugin(
  kad.traverse([
    new kad.traverse.UPNPStrategy({
      mappingTtl: 0, // config.TraversePortForwardTTL
      publicPort: parseInt(node.contact.port)
    }),
    new kad.traverse.NATPMPStrategy({
      mappingTtl: 0, // config.TraversePortForwardTTL
      publicPort: parseInt(node.contact.port)
    })
  ])
);

node.listen(1338);
