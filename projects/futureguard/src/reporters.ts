import { DEFAULT_RULES } from './rules';
import type { ReportFormat, ScanIssue, ScanResult } from './types';

function severityOrder(severity: string): number {
  const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  return order[severity as keyof typeof order] ?? 99;
}

export function formatTextReport(result: ScanResult): string {
  const issues = [...result.issues].sort((a, b) => {
    const diff = severityOrder(a.severity) - severityOrder(b.severity);
    return diff !== 0 ? diff : a.file.localeCompare(b.file) || a.line - b.line;
  });

  const lines: string[] = [];
  lines.push(`FutureGuard scan summary`);
  lines.push(`Target: ${result.target}`);
  lines.push(`Files scanned: ${result.filesScanned}`);
  lines.push(`Issues found: ${result.summary.issuesFound}`);
  lines.push('');

  if (issues.length === 0) {
    lines.push('No security issues were detected.');
    return lines.join('\n');
  }

  for (const issue of issues) {
    lines.push(`${issue.severity.toUpperCase()} | ${issue.label} | ${issue.file}:${issue.line}:${issue.column}`);
    lines.push(`  Rule: ${issue.ruleId}`);
    lines.push(`  Description: ${issue.description}`);
    lines.push(`  Evidence: ${issue.evidence}`);
    lines.push(`  Recommendation: ${issue.recommendation}`);
    lines.push('');
  }

  return lines.join('\n').trim();
}

export function formatJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatSarifReport(result: ScanResult): string {
  const rules = DEFAULT_RULES.map((rule) => ({
    id: rule.id,
    shortDescription: { text: rule.label },
    fullDescription: { text: rule.description },
    help: { text: rule.recommendation },
    defaultConfiguration: { level: rule.severity === 'critical' ? 'error' : rule.severity === 'high' ? 'warning' : 'note' },
    properties: { severity: rule.severity }
  }));

  const sarif = {
    version: '2.1.0',
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'FutureGuard',
            informationUri: 'https://github.com/jagmohan-kurmi/futureguard',
            rules
          }
        },
        results: result.issues.map((issue) => ({
          ruleId: issue.ruleId,
          level: issue.severity === 'critical' ? 'error' : issue.severity === 'high' ? 'warning' : 'note',
          message: { text: issue.description },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: issue.file },
                region: { startLine: issue.line, startColumn: issue.column }
              }
            }
          ],
          properties: {
            evidence: issue.evidence,
            recommendation: issue.recommendation
          }
        }))
      }
    ]
  };

  return JSON.stringify(sarif, null, 2);
}

export function formatReport(result: ScanResult, format: ReportFormat = 'text'): string {
  switch (format) {
    case 'json':
      return formatJsonReport(result);
    case 'sarif':
      return formatSarifReport(result);
    case 'text':
    default:
      return formatTextReport(result);
  }
}
