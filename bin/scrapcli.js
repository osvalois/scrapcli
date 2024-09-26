#!/usr/bin/env node

const { program } = require('commander');
const { version } = require('../package.json');
const commands = require('../src/commands');

program.version(version);

// Register commands
Object.entries(commands).forEach(([name, command]) => {
  program
    .command(name)
    .description(command.description)
    .action(command.action);
});

program.parse(process.argv);