const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const { exec } = require('child_process');
const util = require('util');
const logger = require('./logger');

const execPromise = util.promisify(exec);

const createProject = async (config) => {
  const projectPath = path.join(process.cwd(), config.projectName);
  
  // Create project directory
  await fs.ensureDir(projectPath);
  
  // Create project structure
  const dirs = ['src', 'tests', 'data', 'docs', 'logs'];
  await Promise.all(dirs.map(dir => fs.ensureDir(path.join(projectPath, dir))));
  
  // Generate files from templates
  const templates = [
    { src: 'main.js.ejs', dest: 'src/index.js' },
    { src: 'test.js.ejs', dest: 'tests/index.test.js' },
    { src: 'env.ejs', dest: '.env' },
    { src: 'eslintrc.json.ejs', dest: '.eslintrc.json' },
    { src: 'prettierrc.json.ejs', dest: '.prettierrc' },
    { src: 'gitignore.ejs', dest: '.gitignore' },
    { src: 'readme.md.ejs', dest: 'README.md' },
  ];
  
  for (const template of templates) {
    const content = await ejs.renderFile(path.join(__dirname, '../templates', template.src), config);
    await fs.writeFile(path.join(projectPath, template.dest), content);
  }
  
  // Initialize npm project and install dependencies
  process.chdir(projectPath);
  await execPromise('npm init -y');
  await execPromise('npm install puppeteer cheerio dotenv winston mongodb');
  await execPromise('npm install --save-dev jest eslint prettier');
  
  // Update package.json scripts
  const packageJson = await fs.readJson('./package.json');
  packageJson.scripts = {
    start: 'node src/index.js',
    test: 'jest',
    lint: 'eslint src tests',
    format: 'prettier --write "src/**/*.js" "tests/**/*.js"',
  };
  await fs.writeJson('./package.json', packageJson, { spaces: 2 });
  
  // Initialize git repository
  await execPromise('git init');
  await execPromise('git add .');
  await execPromise('git commit -m "Initial commit"');
  
  logger.info('Project created successfully!');
};

module.exports = {
  createProject,
};