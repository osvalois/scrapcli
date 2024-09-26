# inegi_incidencia

This project is an automatically generated advanced web scraper to extract data from https://www.inegi.org.mx/temas/incidencia/.

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
2. Run `npm install` to install dependencies

## Usage

- To start the scraper: `npm start`
- To run tests: `npm test`
- To run the linter: `npm run lint`
- To format code: `npm run format`

## Configuration

Edit the `.env` file to modify the target URL, HTML selector, tags to extract, and MongoDB connection details.

## Project Structure

```
inegi_incidencia/
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

## License

This project is open source and available under the [MIT License](LICENSE).
