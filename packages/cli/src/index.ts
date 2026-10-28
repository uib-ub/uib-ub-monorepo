#!/usr/bin/env node
import { Command } from 'commander';
import { registerAssetsCommand } from './assets/commands.js';

const program = new Command();

program
  .name('cli')
  .description('CLI tools for the uib-ub monorepo')
  .version('0.0.0');

registerAssetsCommand(program);

// Future command groups (e.g. ingest) are registered here.

program.parseAsync(process.argv);
