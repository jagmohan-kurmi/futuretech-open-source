#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';

import { formatReport, formatTextReport } from './reporters';
import { scanPath } from './scanner';

function printUsage(): void {
  console.log(`FutureGuard CLI

Usage: futureguard <path> [--format text|json|sarif] [--ignore pattern1,pattern2]
`);
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

const target = args[0];
const formatFlag = args.find((arg) => arg.startsWith('--format='));
const ignoreFlag = args.find((arg) => arg.startsWith('--ignore='));
const format = formatFlag ? (formatFlag.split('=')[1] as 'text' | 'json' | 'sarif') : 'text';
const ignorePatterns = ignoreFlag ? ignoreFlag.split('=')[1].split(',').map((value) => value.trim()).filter(Boolean) : [];

try {
  const result = scanPath(target, { ignorePatterns });
  const output = format === 'text' ? formatTextReport(result) : formatReport(result, format);
  console.log(output);

  if (result.summary.issuesFound > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`FutureGuard error: ${message}`);
  process.exit(1);
}
