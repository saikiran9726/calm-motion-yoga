import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\siddu\\.gemini\\antigravity\\brain\\54b0eee9-c44f-475c-8d7b-d97793d58f59';
const DOCS_DIR = 'c:\\Users\\siddu\\Downloads\\fieldnote\\yoga\\docs\\screenshots';

const VIEWPORTS = [
  { name: 'compact_360x800', width: 360, height: 800 },
  { name: 'iphone_390x844', width: 390, height: 844 },
  { name: 'large_412x915', width: 412, height: 915 }
];

async function run() {
  console.log('Testing responsive viewports (360x800, 390x844, 412x915)...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    console.log(`Setting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

    // Test Home
    await page.goto('https://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    const homeShot = `home_${vp.name}.png`;
    await page.screenshot({ path: path.join(DOCS_DIR, homeShot) });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, homeShot) });

    // Check overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`[${vp.name}] Home scroll overflow:`, hasHorizontalScroll);

    // Test Session Live
    await page.goto('https://localhost:5173/session', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    const setupShot = `session_setup_${vp.name}.png`;
    await page.screenshot({ path: path.join(DOCS_DIR, setupShot) });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, setupShot) });
  }

  await browser.close();
  console.log('All responsive viewport tests completed!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
