const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const wasmSrcDir = path.join(rootDir, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const wasmDestDir = path.join(rootDir, 'public', 'mediapipe', 'wasm');
const modelDestDir = path.join(rootDir, 'public', 'models');
const modelFile = path.join(modelDestDir, 'pose_landmarker_lite.task');
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// 1. Copy WASM assets
if (fs.existsSync(wasmSrcDir)) {
  fs.mkdirSync(wasmDestDir, { recursive: true });
  fs.cpSync(wasmSrcDir, wasmDestDir, { recursive: true });
  console.log('✓ Copied MediaPipe WASM assets to public/mediapipe/wasm/');
} else {
  console.warn('⚠ node_modules/@mediapipe/tasks-vision/wasm does not exist yet.');
}

// 2. Download pose_landmarker_lite.task if missing or empty
fs.mkdirSync(modelDestDir, { recursive: true });

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000000) {
      console.log('✓ Model pose_landmarker_lite.task already present (' + fs.statSync(destPath).size + ' bytes)');
      return resolve();
    }

    console.log(`Downloading ${url} ...`);
    const file = fs.createWriteStream(destPath);
    const request = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return request(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download model: HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log('✓ Downloaded pose_landmarker_lite.task successfully (' + fs.statSync(destPath).size + ' bytes)');
            resolve();
          });
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };
    request(url);
  });
}

downloadFile(modelUrl, modelFile)
  .then(() => {
    console.log('MediaPipe assets setup complete.');
  })
  .catch((err) => {
    console.error('Failed to download model:', err);
    process.exit(1);
  });
