#!/usr/bin/env node

const { program } = require('commander');
const newCommand = require('../lib/commands/new');
const configCommand = require('../lib/commands/config');

program
  .version(configCommand.version)
  .description('A CLI tool for generating web scraping projects');

program
  .command('new [projectName]')
  .description('Create a new web scraping project')
  .action(newCommand);

program
  .command('config')
  .description('Configure global settings for ScrapCLI')
  .action(configCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}