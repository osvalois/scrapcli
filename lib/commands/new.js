const inquirer = require('inquirer');
const { createProject } = require('../utils/fileManager');
const { validateProjectName, validateUrl } = require('../utils/validator');

const path = require('path');
const config = require('./config');
const logger = require(config.loggerPath);

const newCommand = async (projectName) => {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter project name:',
        default: projectName,
        validate: validateProjectName,
      },
      {
        type: 'input',
        name: 'url',
        message: 'Enter target URL:',
        validate: validateUrl,
      },
      {
        type: 'input',
        name: 'selector',
        message: 'Enter HTML selector:',
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Enter HTML tags to extract (comma-separated):',
      },
      {
        type: 'input',
        name: 'mongoUri',
        message: 'Enter MongoDB URI:',
        default: config.defaultMongoUri,
      },
      {
        type: 'input',
        name: 'dbName',
        message: 'Enter database name:',
        default: config.defaultDbName,
      },
    ]);

    await createProject(answers);
    logger.success(`Project ${answers.projectName} created successfully!`);
  } catch (error) {
    logger.error('Failed to create project:', error);
  }
};

module.exports = newCommand;