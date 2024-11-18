// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// Scrape route - accepts the URL to scrape
app.get('/scrape', async (req, res) => {
  const url = req.query.url; // Get the URL from the query string
  if (!url) {
    return res.status(400).json({ error: 'Please provide a URL to scrape.' });
  }

  try {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Scrape data (modify this part to match your specific scraping needs)
    const data = await page.evaluate(() => {
      const embedUrls = [];
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

      // Scrape all iframe or embed URLs
      const iframeElements = document.querySelectorAll('iframe');
      iframeElements.forEach((iframe) => {
        const src = iframe.src;
        if (src && !src.includes('ads')) {  // Exclude ad-related URLs
          embedUrls.push(src);
        }
      });

      return { embedUrls, title, description, thumbnail };
    });

    await browser.close();
    res.json(data); // Return the scraped data as a JSON response

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scrape the page.' });
  }
});

// Root route (Optional, but will prevent "Cannot GET /" error)
app.get('/', (req, res) => {
  res.send('Welcome to the Puppeteer Scraper API. Use /scrape?url=your-url to scrape.');
});

// Start the server
app.listen(port, () => {
  console.log(`Puppeteer scraper server is running on http://localhost:${port}`);
});
