const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  const html = req.query.html || req.body?.html || '';
  
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 600, height: 500 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const screenshot = await page.screenshot({ 
    type: 'png',
    clip: { x: 0, y: 0, width: 600, height: 500 }
  });
  
  await browser.close();
  
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(screenshot);
};
