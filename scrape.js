const puppeteer = require('puppeteer');

async function scrape(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Scrape dynamic content after it loads
    const data = await page.evaluate(() => {
        const embedUrls = [];
        const embeds = document.querySelectorAll('iframe, embed');
        embeds.forEach((embed) => {
            const src = embed.getAttribute('src');
            if (src && !src.includes('syndication.realsrv.com')) {
                embedUrls.push(src);
            }
        });

        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const thumbnail = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

        return { embedUrls, title, description, thumbnail };
    });

    await browser.close();

    return data;
}

// Run the scrape function with the URL passed from WordPress
scrape(process.argv[2]).then((data) => {
    console.log(JSON.stringify(data));  // Output the scraped data
});
