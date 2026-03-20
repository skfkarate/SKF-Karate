const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  
  // Wait for the dev server
  await new Promise(r => setTimeout(r, 2000));
  
  // Screenshot the main student search page
  await page.goto('http://localhost:3000/student', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/home/krish/.gemini/antigravity/brain/e33a6869-d30b-472c-8a6d-33e624539cdb/v2_search_page.png', fullPage: true });

  // Screenshot the profile dashboard
  await page.goto('http://localhost:3000/student/SKF-2024-0042', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000)); // allow animations to settle
  await page.screenshot({ path: '/home/krish/.gemini/antigravity/brain/e33a6869-d30b-472c-8a6d-33e624539cdb/v2_profile_page.png', fullPage: true });

  await browser.close();
})();
