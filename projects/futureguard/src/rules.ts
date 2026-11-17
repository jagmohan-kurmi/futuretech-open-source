import type { RuleDefinition } from './types';

export const DEFAULT_RULES: RuleDefinition[] = [
  {
    id: 'hardcoded-api-key',
    label: 'Hardcoded API Key',
    description: 'Possible embedded secret in code or config text.',
    severity: 'critical',
    pattern: /(?:api[_-]?key|secret|token|access[_-]?token)\s*[:=]\s*["'`][A-Za-z0-9_\-./=+:]{12,}["'`]/gi,
    recommendation: 'Move the value to a secure secret manager or environment variable and avoid committing it to source control.'
  },
  {
    id: 'exposed-password',
    label: 'Exposed Password',
    description: 'Password value assigned directly in source or config.',
    severity: 'critical',
    pattern: /(?:password|passwd)\s*[:=]\s*["'`][^"'`]{4,}["'`]/gi,
    recommendation: 'Use a secure secret source, redact test data, and verify the configuration is not shipped in public repositories.'
  },
  {
    id: 'sql-injection-pattern',
    label: 'Potential SQL Injection',
    description: 'String concatenation or unsafe query construction suggests injection risk.',
    severity: 'high',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,180}(?:\+\s*[A-Za-z_$][\w$]*|OR\s+['\"]?1['\"]?\s*=\s*['\"]?1|--|['\"]\s*\))/gi,
    recommendation: 'Use parameterized queries or prepared statements instead of concatenating untrusted user input into SQL statements.'
  },
  {
    id: 'xss-risk',
    label: 'XSS Risk',
    description: 'Dangerous DOM manipulation or HTML injection pattern detected.',
    severity: 'high',
    pattern: /(?:innerHTML\s*=|document\.write\s*\(|outerHTML\s*=|insertAdjacentHTML\s*\()/gi,
    recommendation: 'Use safe templating, context-aware escaping, and verify untrusted content is sanitized before insertion.'
  },
  {
    id: 'unsafe-command-exec',
    label: 'Unsafe Command Execution',
    description: 'Command execution with shell access can enable injection or system takeover.',
    severity: 'high',
    pattern: /(?:child_process\.(?:exec|execSync)|require\(['\"]child_process['\"]\)|subprocess\.(?:run|Popen)|System\.Diagnostics\.Process)/gi,
    recommendation: 'Avoid shell execution when possible and validate all inputs before invoking external processes.'
  },
  {
    id: 'insecure-cors',
    label: 'Insecure CORS Configuration',
    description: 'Cross-origin configuration may allow unrestricted access.',
    severity: 'medium',
    pattern: /(?:Access-Control-Allow-Origin\s*:\s*['\"]\*['\"]|cors\s*\(\s*\{\s*origin\s*:\s*['\"]\*['\"])/gi,
    recommendation: 'Restrict origins to known trusted domains and use explicit allowlists instead of wildcard access.'
  },
  {
    id: 'environment-file',
    label: 'Sensitive Environment File',
    description: 'A local environment file may contain secret values or local credentials.',
    severity: 'medium',
    pattern: /(?:^|\/)(?:\.env(?:\.[A-Za-z0-9_-]+)?|\.env\.local|\.env\.production|\.env\.development)$/,
    recommendation: 'Keep environment files out of source control and use a secure secrets management process for deployment.'
  }
];
