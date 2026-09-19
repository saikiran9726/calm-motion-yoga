import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\siddu\\.gemini\\antigravity\\brain\\54b0eee9-c44f-475c-8d7b-d97793d58f59';
const DOCS_DIR = 'c:\\Users\\siddu\\Downloads\\fieldnote\\yoga\\docs\\screenshots';

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

async function saveShot(page, filename) {
  await page.screenshot({ path: path.join(ARTIFACT_DIR, filename) });
  await page.screenshot({ path: path.join(DOCS_DIR, filename) });
  console.log(`Saved: ${filename}`);
}

async function run() {
  console.log('Launching browser for Live Exercise Session verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. Pre-Session Setup Card
  console.log('Capturing Pre-Session Setup Card...');
  await page.goto('https://localhost:5173/session', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'session_01_setup.png');

  // 2. Countdown State
  console.log('Triggering Countdown...');
  await page.evaluate(() => {
    const readyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("I'm Ready"));
    if (readyBtn) readyBtn.click();
  });
  await new Promise(r => setTimeout(r, 600)); // Catch '3' or '2'
  await saveShot(page, 'session_02_countdown.png');

  // 3. Live Active Session with Skeleton & Correction
  console.log('Waiting for active session tracking & correction...');
  await new Promise(r => setTimeout(r, 5200)); // Wait for countdown to finish and mock to run
  await saveShot(page, 'session_03_live_tracking.png');

  // 4. Paused State
  console.log('Testing Paused State...');
  await page.evaluate(() => {
    const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pause'));
    if (pauseBtn) pauseBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await saveShot(page, 'session_04_state_paused.png');

  // Resume
  await page.evaluate(() => {
    const resumeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Resume'));
    if (resumeBtn) resumeBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Open Simulator Selector
  await page.evaluate(() => {
    const pickerToggle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simulate Sensor States'));
    if (pickerToggle) pickerToggle.click();
  });
  await new Promise(r => setTimeout(r, 200));

  // 5. Simulate Step Back State
  console.log('Testing Step Back State...');
  await page.evaluate(() => {
    const stepBackBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Step Back'));
    if (stepBackBtn) stepBackBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await saveShot(page, 'session_05_state_step_back.png');

  // 6. Simulate Low Light State
  console.log('Testing Low Light State...');
  await page.evaluate(() => {
    const lowLightBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Low Light'));
    if (lowLightBtn) lowLightBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await saveShot(page, 'session_06_state_low_light.png');

  // 7. Simulate Permission Denied State
  console.log('Testing Permission Denied State...');
  await page.evaluate(() => {
    const deniedBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Denied'));
    if (deniedBtn) deniedBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await saveShot(page, 'session_07_state_denied.png');

  // 8. Restore Tracking and trigger Completion Sheet
  console.log('Testing Completion Sheet...');
  await page.evaluate(() => {
    const trackBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tracking'));
    if (trackBtn) trackBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Click "Next Movement" twice to complete all 10 reps
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Movement'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Movement'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  await saveShot(page, 'session_08_completion.png');

  await browser.close();
  console.log('Live Exercise Session screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Session test script error:', err);
  process.exit(1);
});
