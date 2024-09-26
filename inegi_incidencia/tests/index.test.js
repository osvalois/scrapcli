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
