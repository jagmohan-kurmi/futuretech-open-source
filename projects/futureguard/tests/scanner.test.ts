import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { scanFile, scanPath } from '../src/scanner';
import { formatReport } from '../src/reporters';

test('scanFile detects hardcoded API keys and SQL injection patterns', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'futureguard-'));
  const filePath = path.join(tempDir, 'example.js');
  fs.writeFileSync(filePath, `const config = { apiKey: "sk_test_1234567890abcd" }; const query = "SELECT * FROM users WHERE id = " + userId;`);

  const issues = scanFile(filePath, { ignorePatterns: [] });

  assert.ok(issues.some((issue) => issue.ruleId === 'hardcoded-api-key'));
  assert.ok(issues.some((issue) => issue.ruleId === 'sql-injection-pattern'));
});

test('scanPath scans a directory tree and returns severity totals', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'futureguard-'));
  fs.mkdirSync(path.join(tempDir, 'nested'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, 'app.js'), `const secret = { password: "supersecret" };`);
  fs.writeFileSync(path.join(tempDir, 'nested', 'index.js'), `document.body.innerHTML = userInput;`);

  const result = scanPath(tempDir, { ignorePatterns: [] });

  assert.equal(result.summary.filesScanned, 2);
  assert.ok(result.summary.issuesFound >= 2);
  assert.ok(result.summary.bySeverity.critical >= 1);
  assert.ok(result.summary.bySeverity.high >= 1);
});

test('formatReport exports SARIF output', () => {
  const result = {
    target: '/tmp/example',
    filesScanned: 1,
    issues: [
      {
        ruleId: 'xss-risk',
        label: 'XSS Risk',
        severity: 'high',
        description: 'Dangerous DOM manipulation pattern',
        file: '/tmp/example/index.js',
        line: 2,
        column: 10,
        evidence: 'innerHTML = userInput',
        recommendation: 'Sanitize input'
      }
    ],
    summary: {
      filesScanned: 1,
      issuesFound: 1,
      bySeverity: { critical: 0, high: 1, medium: 0, low: 0, info: 0 },
      target: '/tmp/example'
    },
    generatedAt: new Date().toISOString()
  };

  const sarif = formatReport(result as any, 'sarif');
  assert.ok(sarif.includes('"version": "2.1.0"'));
  assert.ok(sarif.includes('"ruleId": "xss-risk"'));
});
