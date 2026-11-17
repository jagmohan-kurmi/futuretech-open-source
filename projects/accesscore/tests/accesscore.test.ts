import test from 'node:test';
import assert from 'node:assert/strict';

import { AccessCore } from '../src/accesscore';

test('role permissions and inheritance work correctly', () => {
  const auth = new AccessCore();
  auth.addRole('admin', ['read', 'write']);
  auth.addRole('editor', ['write'], ['admin']);

  assert.equal(auth.authorize('admin', 'write', 'invoice').allowed, true);
  assert.equal(auth.authorize('editor', 'read', 'invoice').allowed, true);
});

test('default deny blocks unapproved actions', () => {
  const auth = new AccessCore();
  auth.addRole('viewer', ['read']);

  assert.equal(auth.authorize('viewer', 'delete', 'invoice').allowed, false);
});

test('explicit policy rules override allow logic', () => {
  const auth = new AccessCore();
  auth.addRole('editor', ['write']);
  auth.addPolicyRule({ resource: 'invoice', action: 'write', tenant: 'acme', allow: false });

  assert.equal(auth.authorize('editor', 'write', 'invoice', 'acme').allowed, false);
});
