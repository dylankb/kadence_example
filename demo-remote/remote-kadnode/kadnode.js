'use strict';

// Import dependencies
const bunyan = require('bunyan');
const levelup = require('levelup');
const leveldown = require('leveldown');
const encoding = require('encoding-down');
const kad = require('@kadenceproject/kadence');
const async = require('async');
const traverse = require('@kadenceproject/kadence/');
const seedInfo = require('./../seedInfo').seedInfo;
debugger;

const seed = kad({
  identity: seedInfo.identity,
  transport: new kad.HTTPTransport(),
  storage: levelup(encoding(leveldown('./db'))),
  contact: seedInfo.contact
});

seed.traverse = seed.plugin(
  kad.traverse([
    new kad.traverse.UPNPStrategy({
      mappingTtl: 0, // config.TraversePortForwardTTL
      publicPort: parseInt(seed.contact.port)
    }),
    new kad.traverse.NATPMPStrategy({
      mappingTtl: 0, // config.TraversePortForwardTTL
      publicPort: parseInt(seed.contact.port)
    })
  ])
);

seed.listen(1337);
