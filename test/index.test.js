const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const CLI_PATH = path.join(__dirname, '../bin/scrapcli.js');

describe('ScrapCLI', () => {
  const testProjectName = 'test-scraper-project';
  const testProjectPath = path.join(process.cwd(), testProjectName);

  afterEach(async () => {
    // Clean up test project directory
    await fs.remove(testProjectPath);
  });

  describe('new command', () => {
    it('should create a new project with default settings', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} new ${testProjectName}`);
      
      expect(stdout).toContain(`Project ${testProjectName} created successfully!`);
      expect(fs.existsSync(testProjectPath)).toBeTruthy();
      expect(fs.existsSync(path.join(testProjectPath, 'src', 'index.js'))).toBeTruthy();
      expect(fs.existsSync(path.join(testProjectPath, 'tests', 'index.test.js'))).toBeTruthy();
      expect(fs.existsSync(path.join(testProjectPath, '.env'))).toBeTruthy();
    });

    it('should create a new project with custom settings', async () => {
      const customUrl = 'https://example.com';
      const customSelector = '.custom-class';
      const customTags = 'h1,p,a';
      const customMongoUri = 'mongodb://customhost:27017/customdb';

      const { stdout } = await execAsync(`node ${CLI_PATH} new ${testProjectName}`, {
        input: `${customUrl}\n${customSelector}\n${customTags}\n${customMongoUri}\n`,
      });

      expect(stdout).toContain(`Project ${testProjectName} created successfully!`);
      
      const envContent = await fs.readFile(path.join(testProjectPath, '.env'), 'utf-8');
      expect(envContent).toContain(`TARGET_URL=${customUrl}`);
      expect(envContent).toContain(`HTML_SELECTOR=${customSelector}`);
      expect(envContent).toContain(`TAGS_TO_EXTRACT=${customTags}`);
      expect(envContent).toContain(`MONGO_URI=${customMongoUri}`);
    });

    it('should handle errors when creating a new project', async () => {
      // Simulate an error by using an invalid project name
      const invalidProjectName = '!invalid-name';
      
      await expect(execAsync(`node ${CLI_PATH} new ${invalidProjectName}`))
        .rejects.toThrow('Failed to create project');
    });
  });

  describe('config command', () => {
    it('should update global configuration', async () => {
      const newMongoUri = 'mongodb://newhost:27017/newdb';
      const newDbName = 'newdbname';

      const { stdout } = await execAsync(`node ${CLI_PATH} config`, {
        input: `${newMongoUri}\n${newDbName}\n`,
      });

      expect(stdout).toContain('Global configuration updated successfully!');
      
      const configPath = path.join(__dirname, '../lib/config.js');
      const configContent = await fs.readFile(configPath, 'utf-8');
      expect(configContent).toContain(`defaultMongoUri: '${newMongoUri}'`);
      expect(configContent).toContain(`defaultDbName: '${newDbName}'`);
    });

    it('should handle errors when updating configuration', async () => {
      // Simulate an error by making the config file read-only
      const configPath = path.join(__dirname, '../lib/config.js');
      await fs.chmod(configPath, 0o444);

      await expect(execAsync(`node ${CLI_PATH} config`))
        .rejects.toThrow('Failed to update configuration');

      // Restore file permissions
      await fs.chmod(configPath, 0o644);
    });
  });

  describe('CLI general behavior', () => {
    it('should display help information when no command is provided', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH}`);
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('new [projectName]');
      expect(stdout).toContain('config');
    });

    it('should display version information', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
      expect(stdout).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should handle unknown commands', async () => {
      await expect(execAsync(`node ${CLI_PATH} unknown-command`))
        .rejects.toThrow('Unknown command');
    });
  });
});