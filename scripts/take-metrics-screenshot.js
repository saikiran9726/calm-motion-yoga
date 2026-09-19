import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\siddu\\.gemini\\antigravity\\brain\\54b0eee9-c44f-475c-8d7b-d97793d58f59';
const DOCS_DIR = 'c:\\Users\\siddu\\Downloads\\fieldnote\\yoga\\docs\\screenshots';

async function run() {
  console.log('Capturing Live Hardware Metrics Modal...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.goto('https://localhost:5173/session', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Click "I'm Ready"
  await page.evaluate(() => {
    const readyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("I'm Ready"));
    if (readyBtn) readyBtn.click();
  });

  // Wait for live session
  await new Promise(r => setTimeout(r, 5200));

  // Click LIVE COACH button to open DevMetricsModal
  await page.evaluate(() => {
    const liveCoachBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("LIVE COACH"));
    if (liveCoachBtn) liveCoachBtn.click();
  });

  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'session_metrics_modal.png') });
  await page.screenshot({ path: path.join(DOCS_DIR, 'session_metrics_modal.png') });
  console.log('Saved: session_metrics_modal.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
