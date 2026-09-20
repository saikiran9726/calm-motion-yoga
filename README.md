# Calm Motion — On-Device Live Yoga & Physiotherapy Motion Coach

> **"Intelligent movement guidance that lives on your phone, never in the cloud."**

Calm Motion is a premium, mobile-first Yoga and Physiotherapy web application featuring a real-time on-device AI motion coach. It observes movement through your smartphone's front camera and provides soothing, real-time guidance (e.g. *"Lower your right shoulder slightly."*), counts repetitions with range-of-motion tracking, and detects compensations. Camera video is processed on the device and is never uploaded. Only summary metrics (reps or hold time, peak ROM, pain scores, form quality) are sent to the clinic when the user has joined a clinic and is online. The app works offline and syncs when back online.

---

## 🌟 Key Features

1. **Live On-Device Motion Coach**:
   - Analyzes 33 body keypoints on-device in real-time.
   - High-DPR canvas skeleton overlay with gentle pulsing correction highlights.
   - Debounced coaching feedback: one instruction at a time, displayed for at least 1.5 seconds with text and icons (never color alone).

2. **Multilingual Voice Coaching & Input**:
   - Text-to-Speech coaching in English, Hindi (हिन्दी), and Telugu (తెలుగు).
   - Voice pain check-in ("Left knee hurts, about 6") transformed into structured records.

3. **Physiotherapy Intelligence & Safety**:
   - Strict non-diagnostic disclaimer on all clinical screens: *"This app gives movement guidance and is not a medical diagnosis. Stop if you feel sharp pain."*
   - Red flag safety stop: Automatically pauses the workout if pain reaches the stop threshold (default 5, configurable by therapist) or sharp pain is reported.
   - Week-over-week Range of Motion (ROM) progression (e.g., *"Your shoulder lift is 12° higher than last week"*).
   - Adaptive plan rules adjusting next day's reps and holds based on form quality and pain.

4. **Privacy-First & Offline Resilience**:
   - Progressive Web App (PWA) with full offline precaching of models, WASM binaries, fonts, and inline SVG illustrations.
   - Offline exercise support: Complete workouts in Airplane Mode. All video stays in volatile memory and is never uploaded.
   - Resilient data queue: Summary metrics store in local Dexie IndexedDB and sync to the clinic when back online.

5. **Therapist Portal & Clinic Sync**:
   - Dual-role switch: Patient mode and Clinical Therapist mode (secured with clinic passcode, default `CALM2026` in demo mode if unset).
   - Real-time clinical view of patient adherence, pain trajectories, and range of motion.
   - Authenticated REST API (`/api/*`) with JWT bearer authentication, rate limiting, and optional MongoDB Atlas persistence (falling back to in-memory store in dev).

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- Google Chrome, Safari, or Microsoft Edge

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Dev Server
```bash
npm run dev
```
The server will start on local HTTPS:
- Local URL: `https://localhost:5173`
- Network URL: `https://<your-laptop-ip>:5173` (e.g., `https://192.168.29.60:5173`)

*(Note: Because local dev uses self-signed SSL for camera access, click **"Advanced"** and **"Proceed to localhost"** when prompted by your browser).*

---

## 📱 How to Install on Your Phone (PWA)

### Option A: Over Local Wi-Fi (Direct from Laptop)
1. Connect your phone to the same Wi-Fi network as your laptop.
2. Open Safari (iOS) or Chrome (Android) and navigate to `https://<your-laptop-ip>:5173` (e.g., `https://192.168.29.60:5173`).
3. Tap **"Advanced"** → **"Proceed"** to bypass the self-signed SSL warning.
4. Add to Home Screen:
   - **iOS Safari**: Tap the Share button (square with arrow up) → scroll down and tap **"Add to Home Screen"**.
   - **Android Chrome**: Tap the three dots (menu) → tap **"Install app"** or **"Add to Home screen"**.
5. Re-open Calm Motion from your phone's home screen icon. It now runs full-screen like a native app.

### Option B: Free Vercel Deployment
1. Import this repository into [Vercel](https://vercel.com).
2. The included `vercel.json` automatically configures HTTPS and SPA rewrites.
3. Open the production URL on your phone and tap **"Add to Home Screen"**.

### Testing Offline (Airplane Mode)
1. Open Calm Motion on your phone once to allow the service worker to cache all assets.
2. Turn on **Airplane Mode** (disconnect both Wi-Fi and mobile data).
3. Re-open Calm Motion from your home screen.
4. Notice the quiet **"Works offline"** badge. Start an exercise—tracking, voice guidance, and completion work completely offline!

---

## ⚙️ How the Pose Engine Works

1. **Capture & Pre-processing**: Front camera video stream is captured via `navigator.mediaDevices.getUserMedia` in portrait orientation and mirrored for natural human proprioception.
2. **Pose Inference**: MediaPipe Pose Landmarker processes frames using GPU (WebGL/WebGPU) with automatic CPU fallback.
3. **Signal Smoothing (One Euro Filter)**: Raw landmark coordinates pass through an adaptive low-pass filter to dampen low-speed jitter while preserving rapid movement responsiveness without lag.
4. **Biomechanical Geometry**: Angles are calculated across joint vertices (shoulder, elbow, hip, knee, spine) using 2D/3D vector dot products, normalized by torso height.
5. **State Machines**:
   - **Repetition Machine**: Hysteresis thresholds, minimum rep duration, and partial-rep rejection.
   - **Yoga Hold Machine**: Accumulates hold duration only while alignment is within prescribed tolerance windows; monitors body sway and tremor.
6. **Priority Rule Arbiter**: Evaluates form checks and compensation rules (knee valgus, shoulder shrug, excessive trunk lean), emitting **only the single highest-priority correction** at any moment.

---

## 📊 Live Metrics Panel (Judge & Dev Tool)

During any active exercise session, **tap the "LIVE COACH" emerald badge** at the top of the screen to open the Live On-Device Metrics Panel:
- **Frame Rate**: Real-time measured FPS from the animation loop.
- **Inference Time**: Real-time measured MediaPipe inference latency in ms/frame.
- **Hardware Delegate**: Detected runtime delegate (`GPU (WebGL)` or `CPU Fallback`).
- **Network State**: Real-time network detection (`Offline` vs `Online`).
- **Battery Level & State**: Live battery percentage read via the Battery Status API (where supported by browser).
- **JS Heap Memory**: Real-time JS heap memory usage from `performance.memory` (where supported by Chromium).

---

---

## ☁️ Step-by-Step Deployment Guide

### Option 1: Vercel + GitHub (Recommended)
1. **Push to a new GitHub repository:**
   ```bash
   git remote add origin https://github.com/<your-username>/calm-motion-yoga.git
   git branch -M main
   git push -u origin main
   ```
2. **Import into Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
   - Click **"Add New..."** → **"Project"**.
   - Select your repository (`calm-motion-yoga`) and click **"Import"**.
   - Framework Preset will automatically detect **Vite**.
   - Expand **"Environment Variables"** and add:
     - `CLINIC_ADMIN_PASSCODE` = `<your-secure-clinic-passcode>`
     - `JWT_SECRET` = `<min-32-char-random-secret>`
     - `MONGODB_URI` = `<your-mongodb-atlas-connection-string>`
   - Click **"Deploy"**. Future git pushes will automatically redeploy!

### Option 2: Drag & Drop Fallback (Netlify Drop)
If you prefer zero command-line deployment:
1. Run `npm run build` locally to generate the production `dist` directory.
2. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3. Drag and drop the `dist/` folder directly into the browser window.
4. Your PWA will be live on an HTTPS link in under 15 seconds!

---

## 🍃 MongoDB Atlas Setup Guide (Exact Clicks)
If you want persistent cloud storage for the clinic dashboard:
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and click **"Try Free"**.
2. **Create Cluster:** Choose the **Shared Free (M0)** tier, select your closest cloud region, and click **"Create Deployment"**.
3. **Create Database User:** Enter a Username (e.g. `calm_admin`) and a secure Password. Click **"Create Database User"**.
4. **Network Access:** In the "Where would you like to connect from?" prompt, select **"Allow Access from Anywhere"** (`0.0.0.0/0`) so Vercel serverless functions can connect. Click **"Finish and Close"**.
5. **Copy Connection String:** Click **"Connect"** → **"Drivers"** → Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/calm_motion?retryWrites=true&w=majority
   ```
6. **Add to Vercel:** Go to your Vercel Project Settings → **"Environment Variables"** → Add `MONGODB_URI` with this connection string. Click **"Redeploy"**.

---

## ⚠️ Known Limitations & Prototype Boundaries

1. **Lighting & Distance**: On-device computer vision requires sufficient room light and phone placement approximately 2 meters away so the full body remains visible in frame.
2. **Web Speech API Language Packs**: Text-to-speech for Hindi and Telugu depends on whether your operating system has downloaded the respective language voice pack. If absent, the app falls back gracefully to on-screen text cues with a clear notice.
3. **NPU Hardware Counters**: Mobile browsers sandbox hardware access and do not expose raw NPU utilization counters to JavaScript; GPU acceleration is actively measured and verified.
4. **Adjuvant Tool, Not Medical Diagnosis**: Calm Motion provides movement guidance and alignment checks. It is designed to assist licensed physical therapists and cannot provide medical diagnoses or replace clinical care.
