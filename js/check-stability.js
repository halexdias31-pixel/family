#!/usr/bin/env node
/* @family. — check-stability.js: data/stability.json is what tools/stability.js computes now, so the Stability card never goes stale (730). */
'use strict';
const path = require('path'), { execFileSync } = require('child_process');
try {
  process.stdout.write(execFileSync(process.execPath, [path.join(__dirname, '..', 'tools', 'stability.js'), '--check'], { encoding: 'utf8' }));
} catch (e) { process.stdout.write(String(e.stdout || e.message)); process.exit(1); }
