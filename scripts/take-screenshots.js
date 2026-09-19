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
  console.log('Launching browser via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Standard 390x844 viewport for all patient screens
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  // 1. Onboarding Step 1 (Language)
  console.log('Capturing Onboarding Step 1...');
  await page.goto('https://localhost:5173/onboarding', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await saveShot(page, 'screen_01_onboarding.png');

  // 1b. Onboarding Step 2 (Goal)
  console.log('Capturing Onboarding Step 2...');
  const continueBtn = await page.$('button.bg-forest');
  if (continueBtn) await continueBtn.click();
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_01b_onboarding_step2.png');

  // 1c. Onboarding Step 3 (Camera permission & privacy)
  console.log('Capturing Onboarding Step 3...');
  const confirmBtn = await page.$('button.bg-forest');
  if (confirmBtn) await confirmBtn.click();
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_01c_onboarding_step3.png');

  // 2. Home Screen
  console.log('Capturing Home Screen...');
  await page.goto('https://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_02_home.png');

  // 3. Explore Screen
  console.log('Capturing Explore Screen...');
  await page.goto('https://localhost:5173/explore', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_03_explore.png');

  // 4. Yoga Pose Detail Screen
  console.log('Capturing Yoga Pose Detail Screen (Warrior II)...');
  await page.goto('https://localhost:5173/yoga/pose/warrior-2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_04_yoga_pose_detail.png');

  // 5. Physiotherapy: My Recovery Screen
  console.log('Capturing Physiotherapy My Recovery Screen...');
  await page.goto('https://localhost:5173/physio/recovery', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_05_physio_recovery.png');

  // 6. Progress Screen
  console.log('Capturing Progress Screen...');
  await page.goto('https://localhost:5173/progress', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_06_progress.png');

  // 7. Profile / You Screen
  console.log('Capturing Profile Screen...');
  await page.goto('https://localhost:5173/profile', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveShot(page, 'screen_07_profile.png');

  await browser.close();
  console.log('All patient screen screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
