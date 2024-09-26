# ScrapCLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/osvalois/scrapcli/workflows/Node.js%20CI/badge.svg)](https://github.com/osvalois/scrapcli/actions)
[![npm version](https://badge.fury.io/js/scrapcli.svg)](https://badge.fury.io/js/scrapcli)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

ScrapCLI is a powerful and flexible command-line interface tool designed to generate customized web scraping projects. It streamlines the process of setting up a new web scraper, allowing developers to focus on the specific scraping logic rather than project setup.

## Features

- 🚀 Rapid project initialization
- 📁 Automated project structure generation
- 🔧 Built-in configuration for popular tools (ESLint, Prettier, Jest)
- 🕷️ Basic web scraper template using Puppeteer and Cheerio
- 📊 MongoDB integration for data storage
- 📝 Comprehensive logging with Winston
- 🧪 Unit testing setup with Jest

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

Ensure you have Node.js (v14 or later) and npm installed on your system.

```bash
npm install -g scrapcli
```

Or run it directly using npx:

```bash
npx scrapcli
```

## Usage

To create a new web scraping project:

```bash
scrapcli new my-scraper-project
```

Follow the interactive prompts to configure your project:

1. Enter the target URL for scraping
2. Specify the HTML selector to analyze
3. List the HTML tags to extract (comma-separated)
4. Provide MongoDB connection details

After the project is generated, navigate to the project directory and install dependencies:

```bash
cd my-scraper-project
npm install
```

## Project Structure

ScrapCLI generates the following project structure:

```
my-scraper-project/
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
```

## Configuration

The generated project uses several configuration files:

- `.env`: Contains environment variables including the target URL, selectors, and MongoDB details.
- `.eslintrc.json`: ESLint configuration for code linting.
- `.prettierrc`: Prettier configuration for code formatting.
- `.gitignore`: Specifies intentionally untracked files to ignore.

## Scripts

The generated `package.json` includes the following npm scripts:

- `npm start`: Run the web scraper
- `npm test`: Execute the test suite
- `npm run lint`: Lint the source code
- `npm run format`: Format the source code

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Oscar Valois - [@osvalois](https://twitter.com/osvalois) - oscar@example.com

Project Link: [https://github.com/osvalois/scrapcli](https://github.com/osvalois/scrapcli)

## Acknowledgements

- [Puppeteer](https://pptr.dev/)
- [Cheerio](https://cheerio.js.org/)
- [MongoDB](https://www.mongodb.com/)
- [Winston](https://github.com/winstonjs/winston)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

---

Made with ❤️ by [Oscar Valois](https://github.com/osvalois)