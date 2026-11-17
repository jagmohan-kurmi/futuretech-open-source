#!/usr/bin/env node

import { AccessCore } from './accesscore';

const core = new AccessCore();
core.addRole('admin', ['read', 'write']);
core.addRole('editor', ['write'], ['admin']);
core.addPolicyRule({ resource: 'invoice', action: 'write', allow: false, tenant: 'acme' });

const role = process.argv[2] ?? 'admin';
const action = process.argv[3] ?? 'write';
const resource = process.argv[4] ?? 'invoice';
const tenant = process.argv[5];

console.log(JSON.stringify(core.authorize(role, action, resource, tenant), null, 2));
