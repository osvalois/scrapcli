.PHONY: install test lint format clean

install:
	npm install

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf node_modules
	rm -rf coverage

publish:
	npm publish

.DEFAULT_GOAL := install