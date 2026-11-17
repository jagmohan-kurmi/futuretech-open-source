import * as fs from 'node:fs';
import * as path from 'node:path';

import { DEFAULT_RULES } from './rules';
import type { RuleDefinition, ScanIssue, ScanOptions, ScanResult, Severity } from './types';

const DEFAULT_IGNORE_PATTERNS = ['node_modules', '.git', 'dist', 'coverage', '.next', '.venv', 'vendor'];

function normalizeRelativePath(filePath: string, root: string): string {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function getLineAndColumn(source: string, index: number): { line: number; column: number } {
  const before = source.slice(0, index);
  const lineBreaks = before.split(/\r?\n/);
  const line = lineBreaks.length;
  const column = lineBreaks[lineBreaks.length - 1].length + 1;
  return { line, column };
}

function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  const normalized = filePath.split(path.sep).join('/');
  return ignorePatterns.some((pattern) => normalized.includes(pattern));
}

function buildRuleMatches(content: string, rule: RuleDefinition): Array<{ match: string; index: number }> {
  const regex = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);
  const matches: Array<{ match: string; index: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match[0] === '') {
      regex.lastIndex += 1;
    }

    matches.push({
      match: match[0],
      index: match.index
    });
  }

  return matches;
}

function createIssue(rule: RuleDefinition, file: string, content: string, match: string, index: number): ScanIssue {
  const { line, column } = getLineAndColumn(content, index);

  return {
    ruleId: rule.id,
    label: rule.label,
    severity: rule.severity,
    description: rule.description,
    file,
    line,
    column,
    evidence: match.trim(),
    recommendation: rule.recommendation
  };
}

export function scanFile(filePath: string, options: ScanOptions = {}): ScanIssue[] {
  const resolvedPath = path.resolve(filePath);
  const content = fs.readFileSync(resolvedPath, 'utf8');
  const ignorePatterns = [...DEFAULT_IGNORE_PATTERNS, ...(options.ignorePatterns ?? [])];

  if (shouldIgnore(resolvedPath, ignorePatterns)) {
    return [];
  }

  const issues: ScanIssue[] = [];
  const fileName = path.basename(resolvedPath);

  for (const rule of DEFAULT_RULES) {
    const envFileRegex = new RegExp(rule.pattern.source, rule.pattern.flags);
    rule.pattern.lastIndex = 0;

    if (rule.id === 'environment-file' && !envFileRegex.test(fileName)) {
      continue;
    }

    if (rule.id !== 'environment-file') {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(content)) {
        continue;
      }
    }

    const matches = buildRuleMatches(content, rule);

    for (const item of matches) {
      issues.push(createIssue(rule, resolvedPath, content, item.match, item.index));
    }

    if (rule.id === 'environment-file' && !matches.length && envFileRegex.test(fileName)) {
      issues.push({
        ruleId: rule.id,
        label: rule.label,
        severity: rule.severity,
        description: rule.description,
        file: resolvedPath,
        line: 1,
        column: 1,
        evidence: fileName,
        recommendation: rule.recommendation
      });
    }
  }

  return issues;
}

export function scanPath(targetPath: string, options: ScanOptions = {}): ScanResult {
  const resolvedTarget = path.resolve(targetPath);
  const stats = fs.existsSync(resolvedTarget) ? fs.statSync(resolvedTarget) : null;

  if (!stats) {
    throw new Error(`Target path does not exist: ${resolvedTarget}`);
  }

  const issues: ScanIssue[] = [];
  const ignorePatterns = [...DEFAULT_IGNORE_PATTERNS, ...(options.ignorePatterns ?? [])];
  let filesScanned = 0;

  function walk(currentPath: string): void {
    if (shouldIgnore(currentPath, ignorePatterns)) {
      return;
    }

    const entry = fs.statSync(currentPath);
    if (entry.isDirectory()) {
      for (const child of fs.readdirSync(currentPath)) {
        walk(path.join(currentPath, child));
      }
      return;
    }

    if (!entry.isFile()) {
      return;
    }

    const maxFileSize = options.maxFileSizeBytes ?? 2_000_000;
    if (entry.size > maxFileSize) {
      return;
    }

    filesScanned += 1;
    issues.push(...scanFile(currentPath, options));
  }

  walk(resolvedTarget);

  const severityKeys: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const bySeverity = severityKeys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {} as Record<Severity, number>);

  for (const issue of issues) {
    bySeverity[issue.severity] += 1;
  }

  return {
    target: resolvedTarget,
    filesScanned,
    issues,
    summary: {
      filesScanned,
      issuesFound: issues.length,
      bySeverity,
      target: resolvedTarget
    },
    generatedAt: new Date().toISOString()
  };
}

export { DEFAULT_RULES };
