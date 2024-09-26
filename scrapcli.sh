#!/usr/bin/env bash

set -euo pipefail

# Colors for messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print error messages
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Function to print success messages
success() {
    echo -e "${GREEN}Success: $1${NC}"
}

# Function to print warning messages
warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Function to print info messages
info() {
    echo -e "${BLUE}Info: $1${NC}"
}

# Function to validate URL
validate_url() {
    if [[ $1 =~ ^https?:// ]]; then
        return 0
    else
        return 1
    fi
}

# Function to validate project name
validate_project_name() {
    if [[ $1 =~ ^[a-zA-Z0-9_-]+$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to prompt user input
prompt_user() {
    local prompt="$1"
    local variable_name="$2"
    local validation_function="${3:-}"
    local error_message="${4:-Invalid input. Please try again.}"

    while true; do
        read -p "$prompt" input
        if [ -n "$validation_function" ]; then
            if $validation_function "$input"; then
                eval "$variable_name='$input'"
                break
            else
                warning "$error_message"
            fi
        else
            eval "$variable_name='$input'"
            break
        fi
    done
}

# Check for required commands
check_dependencies() {
    local deps=("npm" "node" "git")
    for cmd in "${deps[@]}"; do
        if ! command -v $cmd &> /dev/null; then
            error "$cmd is required but not installed. Please install it and try again."
        fi
    done
    info "All required dependencies are installed."
}

# Create project structure
create_project_structure() {
    mkdir -p "$project_name"/{src,tests,data,docs,logs}
    cd "$project_name" || error "Could not access project directory"
    info "Project structure created."
}

# Initialize Node.js project
init_node_project() {
    npm init -y || error "Could not initialize Node.js project"
    info "Node.js project initialized."
}

# Install project dependencies
install_dependencies() {
    npm install puppeteer cheerio dotenv winston mongodb || error "Could not install dependencies"
    npm install --save-dev jest eslint prettier || error "Could not install development dependencies"
    info "All dependencies installed successfully."
}

# Create main scraper file
create_scraper_file() {
    cat > src/index.js << EOL
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { MongoClient } = require('mongodb');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'web-scraper' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

let mongoClient;

const connectToDatabase = async () => {
  try {
    mongoClient = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await mongoClient.connect();
    logger.info('Connected to MongoDB');
    return mongoClient.db(process.env.DB_NAME);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

const scrapeWebsite = async (db) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(process.env.TARGET_URL, { waitUntil: 'networkidle0' });
    const html = await page.content();

    const $ = cheerio.load(html);
    const results = [];

    $(process.env.HTML_SELECTOR).each((index, element) => {
      const item = {};
      process.env.TAGS_TO_EXTRACT.split(',').forEach(tag => {
        item[tag.trim()] = $(element).find(tag).text().trim();
      });
      results.push(item);
    });

    const outputPath = path.join(__dirname, '..', 'data', \`scraped_data_\${Date.now()}.json\`);
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

    // Save results to MongoDB
    const collection = db.collection('scraped_data');
    if (results.length > 0) {
      await collection.insertMany(results);
      logger.info(\`\${results.length} documents inserted into MongoDB\`);
    } else {
      logger.warn('No data scraped. Nothing to insert into MongoDB.');
    }

    logger.info(\`Scraping completed. Results saved in \${outputPath} and MongoDB\`);
    return results;
  } catch (error) {
    logger.error('Error during scraping:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const main = async () => {
  try {
    const db = await connectToDatabase();
    const results = await scrapeWebsite(db);
    logger.info(\`Scraped \${results.length} items\`);
  } catch (error) {
    logger.error('Unhandled error:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      logger.info('Disconnected from MongoDB');
    }
  }
};

main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
EOL
    info "Main scraper file (index.js) created."
}

# Create test file
create_test_file() {
    cat > tests/index.test.js << EOL
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');
const { scrapeWebsite } = require('../src/index');

jest.mock('fs').promises;
jest.mock('puppeteer');
jest.mock('mongodb');

describe('Web Scraper', () => {
  let mockDb;

  beforeEach(() => {
    jest.resetModules();
    process.env.TARGET_URL = 'https://example.com';
    process.env.HTML_SELECTOR = '.test-selector';
    process.env.TAGS_TO_EXTRACT = 'h1,p';

    mockDb = {
      collection: jest.fn().mockReturnValue({
        insertMany: jest.fn().mockResolvedValue(true)
      })
    };
  });

  it('should scrape data correctly and save to MongoDB', async () => {
    const mockHtml = '<html><body><div class="test-selector"><h1>Test Title</h1><p>Test Paragraph</p></div></body></html>';
    
    const mockPage = {
      goto: jest.fn(),
      content: jest.fn().mockResolvedValue(mockHtml),
      setUserAgent: jest.fn(),
    };

    const mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };

    puppeteer.launch.mockResolvedValue(mockBrowser);
    fs.promises.writeFile.mockResolvedValue();

    const result = await scrapeWebsite(mockDb);

    expect(result).toEqual([{ h1: 'Test Title', p: 'Test Paragraph' }]);
    expect(fs.promises.writeFile).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
    expect(mockDb.collection().insertMany).toHaveBeenCalledWith([{ h1: 'Test Title', p: 'Test Paragraph' }]);
  });

  it('should handle errors gracefully', async () => {
    puppeteer.launch.mockRejectedValue(new Error('Test error'));

    await expect(scrapeWebsite(mockDb)).rejects.toThrow('Test error');
  });
});
EOL
    info "Test file created."
}

# Create configuration files
create_config_files() {
    # Create .env file
    cat > .env << EOL
TARGET_URL=$url
HTML_SELECTOR=$html_selector
TAGS_TO_EXTRACT=$tags_to_extract
MONGO_URI=$mongo_uri
DB_NAME=$db_name
EOL

    # Create .eslintrc.json
    cat > .eslintrc.json << EOL
{
  "env": {
    "node": true,
    "es2021": true,
    "jest": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": ["warn"]
  }
}
EOL

    # Create .prettierrc
    cat > .prettierrc << EOL
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
EOL

    # Create .gitignore
    cat > .gitignore << EOL
# Dependencies
node_modules/

# Logs
logs/
*.log

# Environment files
.env

# Operating system files
.DS_Store
Thumbs.db

# Code coverage directories
coverage/

# Temporary files
*.tmp
*.temp

# IDE configuration files
.vscode/
.idea/

# Build files
build/
dist/

# Cache files
.cache/
EOL

    info "Configuration files created."
}

# Create README file
create_readme() {
    cat > README.md << EOL
# $project_name

This project is an automatically generated advanced web scraper to extract data from $url.

## Features

- Scraping of specific URL
- Use of Puppeteer to handle dynamic content
- Extraction of specific tags
- Advanced logging with Winston
- Data storage in MongoDB
- Unit testing with Jest
- Linting with ESLint
- Code formatting with Prettier

## Requirements

- Node.js (version 14 or higher)
- npm
- MongoDB

## Installation

1. Clone this repository
2. Run \`npm install\` to install dependencies

## Usage

- To start the scraper: \`npm start\`
- To run tests: \`npm test\`
- To run the linter: \`npm run lint\`
- To format code: \`npm run format\`

## Configuration

Edit the \`.env\` file to modify the target URL, HTML selector, tags to extract, and MongoDB connection details.

## Project Structure

\`\`\`
$project_name/
├── src/
│   └── index.js
├── tests/
│   └── index.test.js
├── data/
├── docs/
├── logs/
├── .env
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── package.json
└── README.md
\`\`\`

## License

This project is open source and available under the [MIT License](LICENSE).
EOL
    info "README file created."
}

# Update package.json
update_package_json() {
    npm pkg set scripts.start="node src/index.js"
    npm pkg set scripts.test="jest"
    npm pkg set scripts.lint="eslint src tests"
    npm pkg set scripts.format="prettier --write \"src/**/*.js\" \"tests/**/*.js\""
    info "package.json updated with custom scripts."
}

# Initialize git repository
init_git_repo() {
    git init
    git add .
    git commit -m "Initial commit"
    info "Git repository initialized."
}

# Main function to orchestrate the script
main() {
    info "Starting project creation..."
    
    check_dependencies
    
    prompt_user "Enter project name: " project_name validate_project_name "Project name can only contain letters, numbers, hyphens and underscores."
    prompt_user "Enter URL to scrape: " url validate_url "Invalid URL. Please enter a valid URL (must start with http:// or https://)"
    prompt_user "Enter HTML selector to analyze (can be a CSS or XPath selector): " html_selector
    prompt_user "Enter tags to extract (separated by commas): " tags_to_extract
    prompt_user "Enter MongoDB connection string: " mongo_uri
    prompt_user "Enter MongoDB database name: " db_name
    
    create_project_structure
    init_node_project
    install_dependencies
    create_scraper_file
    create_test_file
    create_config_files
    create_readme
    update_package_json
    init_git_repo
    
    success "Project $project_name successfully created."
    info "To begin, run:"
    info "cd $project_name && npm install && npm start"
}

# Run the main function
main