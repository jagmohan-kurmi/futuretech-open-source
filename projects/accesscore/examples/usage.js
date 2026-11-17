const { AccessCore } = require('../dist/src');

const auth = new AccessCore();
auth.addRole('admin', ['read', 'write']);
console.log(JSON.stringify(auth.authorize('admin', 'read', 'invoice')));
