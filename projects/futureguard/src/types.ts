export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ReportFormat = 'text' | 'json' | 'sarif';

export interface RuleDefinition {
  id: string;
  label: string;
  description: string;
  severity: Severity;
  pattern: RegExp;
  recommendation: string;
}

export interface ScanIssue {
  ruleId: string;
  label: string;
  severity: Severity;
  description: string;
  file: string;
  line: number;
  column: number;
  evidence: string;
  recommendation: string;
}

export interface ScanSummary {
  filesScanned: number;
  issuesFound: number;
  bySeverity: Record<Severity, number>;
  target: string;
}

export interface ScanResult {
  target: string;
  filesScanned: number;
  issues: ScanIssue[];
  summary: ScanSummary;
  generatedAt: string;
}

export interface ScanOptions {
  maxFileSizeBytes?: number;
  ignorePatterns?: string[];
}
