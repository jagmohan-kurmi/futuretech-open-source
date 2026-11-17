# AccessCore

AccessCore is a lightweight, framework-independent authorization library designed for role-based access control, permission inheritance and multi-tenant policy evaluation.

## Features
- Role and permission management
- Permission inheritance
- Resource-scoped authorization
- Multi-tenant isolation checks
- Default-deny evaluation
- Audit logging interfaces

## Install

```bash
npm install @jagmohan-kurmi/accesscore
```

## Quick start

```js
const { AccessCore } = require('@jagmohan-kurmi/accesscore');
const auth = new AccessCore();
auth.addRole('admin', ['read', 'write']);
console.log(auth.authorize('admin', 'write'));
```
