# FutureGuard

FutureGuard is a local-first security scanner for AI-generated source code. It helps identify hardcoded secrets, risky patterns, unsafe execution, and insecure configuration before code is shipped.

## Features
- Hardcoded API key detection
- Exposed password detection
- SQL injection pattern detection
- XSS risk detection
- Unsafe command execution detection
- Insecure CORS config detection
- Sensitive environment file detection
- Severity classification
- Text, JSON and SARIF report generation

## Installation

```bash
npm install --save @jagmohan-kurmi/futureguard
```

## Quick start

```bash
npx futureguard . --format text
```

## Example usage

```js
const { scanPath, formatReport } = require('@jagmohan-kurmi/futureguard');

const result = scanPath('./src');
console.log(formatReport(result, 'json'));
```

## CLI options

```bash
futureguard ./project --format sarif --ignore node_modules,dist
```

## Security model
FutureGuard is a signal generator for suspicious code patterns. It should be used together with secure review practices, dependency scanning, and secret management tooling.

## License
MIT
