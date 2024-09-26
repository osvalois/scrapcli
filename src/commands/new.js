const inquirer = require('inquirer');
const { createProject } = require('../utils/fileManager');
const { validateProjectName, validateUrl } = require('../utils/validator');
const logger = require('../utils/logger');

const newCommand = {
  description: 'Create a new web scraping project',
  action: async (projectName) => {
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
          default: 'mongodb://localhost:27017/scraper',
        },
        {
          type: 'input',
          name: 'dbName',
          message: 'Enter database name:',
          default: 'scraper',
        },
      ]);

      await createProject(answers);
      logger.success(`Project ${answers.projectName} created successfully!`);
    } catch (error) {
      logger.error('Failed to create project:', error);
    }
  },
};

module.exports = newCommand;