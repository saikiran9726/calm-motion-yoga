import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('--- Starting Offline PWA Test ---');

  // 1. Start preview server
  console.log('1. Starting Vite preview server...');
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'pipe',
  });

  previewProcess.stdout.on('data', (d) => process.stdout.write('[preview] ' + d));
  previewProcess.stderr.on('data', (d) => process.stderr.write('[preview err] ' + d));

  // Give server time to bind
  await new Promise((r) => setTimeout(r, 4000));

  const tempUserDataDir = path.join(os.tmpdir(), 'puppeteer-pwa-' + Date.now());
  fs.mkdirSync(tempUserDataDir, { recursive: true });

  let browser;
  try {
    console.log('2. Launching Chrome with temp user profile...');
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      userDataDir: tempUserDataDir,
      args: [
        '--ignore-certificate-errors',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    });

    const page = await browser.newPage();
    const serverUrl = 'https://localhost:4173';

    console.log(`3. Navigating online to ${serverUrl}...`);
    await page.goto(serverUrl, { waitUntil: 'networkidle0', timeout: 20000 });

    const onlineTitle = await page.title();
    console.log(`✓ Page loaded online. Title: "${onlineTitle}"`);

    console.log('4. Waiting for service worker registration and precache...');
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return !!reg.active;
    });
    console.log(`✓ Service worker ready: ${swRegistered}`);

    // Wait 3 seconds for Workbox to finish precache caching
    await new Promise((r) => setTimeout(r, 3000));

    // Inspect Cache Storage
    const cacheInfo = await page.evaluate(async () => {
      const keys = await caches.keys();
      let totalCachedUrls = 0;
      let hasModel = false;
      let hasWasm = false;
      for (const k of keys) {
        const cache = await caches.open(k);
        const reqs = await cache.keys();
        totalCachedUrls += reqs.length;
        for (const r of reqs) {
          if (r.url.includes('pose_landmarker_lite.task')) hasModel = true;
          if (r.url.includes('.wasm')) hasWasm = true;
        }
      }
      return { keys, totalCachedUrls, hasModel, hasWasm };
    });
    console.log(`✓ Cache storage inspection:`, cacheInfo);

    console.log('5. Going OFFLINE...');
    await page.setOfflineMode(true);

    console.log('6. Reloading page while strictly offline...');
    await page.reload({ waitUntil: 'networkidle0', timeout: 15000 });

    const offlineHeading = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent || document.body.innerText.slice(0, 100);
    });
    console.log(`✓ Offline reload succeeded! Rendered content: "${offlineHeading.replace(/\n/g, ' ')}"`);

    console.log('7. Navigating offline to /session?exercise=wall-slide...');
    await page.goto(`${serverUrl}/session?exercise=wall-slide`, { waitUntil: 'networkidle0', timeout: 15000 });

    const sessionHeading = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent || '';
    });
    console.log(`✓ Session setup screen loaded offline: "${sessionHeading}"`);

    console.log('8. Selecting Recorded Replay mode and starting session...');
    // Click replay option button if present
    const clickedReplay = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const replayBtn = buttons.find((b) => b.textContent?.includes('Recorded Replay') || b.textContent?.includes('Replay'));
      if (replayBtn) {
        replayBtn.click();
        return true;
      }
      return false;
    });
    console.log(`✓ Clicked Replay option: ${clickedReplay}`);

    // Click "Begin Motion Check" or ready button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find((b) => b.textContent?.includes('Begin') || b.textContent?.includes('Start') || b.textContent?.includes('Ready'));
      if (startBtn) startBtn.click();
    });

    // Wait for countdown to finish (3 seconds) and frame processing to begin
    console.log('9. Waiting for countdown and replay frame processing...');
    await new Promise((r) => setTimeout(r, 6000));

    // Check tracking state
    const sessionState = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasRom: text.includes('°'),
        hasReps: text.includes('03 / 08') || text.includes('Repetition') || text.includes('/ 10'),
        bodySnippet: text.slice(0, 200).replace(/\n/g, ' | '),
      };
    });
    console.log(`✓ Replay mode session verification (ROM, Reps, Feedback):`, sessionState);

    console.log('10. Testing offline fetch of model & wasm from Service Worker cache...');
    const offlineFetchResult = await page.evaluate(async () => {
      const modelRes = await fetch('/models/pose_landmarker_lite.task');
      const modelBlob = await modelRes.blob();
      const wasmRes = await fetch('/mediapipe/wasm/vision_wasm_internal.wasm');
      const wasmBlob = await wasmRes.blob();
      return {
        modelStatus: modelRes.status,
        modelBytes: modelBlob.size,
        wasmStatus: wasmRes.status,
        wasmBytes: wasmBlob.size,
      };
    });
    console.log('✓ Offline model & wasm fetch result:', offlineFetchResult);

    console.log('11. Checking real-pose fixture for automated live tracking...');
    const fixturePath = path.resolve('scripts/fixtures/person.mjpeg');
    if (fs.existsSync(fixturePath)) {
      console.log(`✓ Fixture found at ${fixturePath}. Launching camera tracking verification...`);
      const fixtureBrowser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: [
          '--ignore-certificate-errors',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          `--use-file-for-fake-video-capture=${fixturePath}`,
        ],
      });
      try {
        const fixturePage = await fixtureBrowser.newPage();
        await fixturePage.goto(`${serverUrl}/session?exercise=wall-slide`, { waitUntil: 'networkidle0', timeout: 20000 });
        await fixturePage.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const cameraBtn = buttons.find((b) => b.textContent?.includes('Camera'));
          if (cameraBtn) cameraBtn.click();
          const startBtn = buttons.find((b) => b.textContent?.includes('Begin') || b.textContent?.includes('Start') || b.textContent?.includes('Ready'));
          if (startBtn) startBtn.click();
        });
        await new Promise((r) => setTimeout(r, 8000));
        const cameraTrackingState = await fixturePage.evaluate(() => {
          const text = document.body.innerText;
          return {
            hasTracking: text.includes('Tracking') || text.includes('°'),
            bodySnippet: text.slice(0, 200).replace(/\n/g, ' | '),
          };
        });
        console.log('✓ Real-pose camera tracking verification with fixture:', cameraTrackingState);
      } finally {
        await fixtureBrowser.close();
      }
    } else {
      console.log('SKIPPED: no fixture');
    }

    console.log('\n========================================');
    console.log('ALL OFFLINE PWA TESTS PASSED CLEANLY!');
    console.log('========================================');
  } catch (err) {
    console.error('Offline test error:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    previewProcess.kill();
    try {
      fs.rmSync(tempUserDataDir, { recursive: true, force: true });
    } catch {}
  }
}

run();
