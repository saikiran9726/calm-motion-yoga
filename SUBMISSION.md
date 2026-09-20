# Calm Motion — Hackathon Submission Pack

**Live Production URL:** [https://calm-motion-yoga.vercel.app](https://calm-motion-yoga.vercel.app)  
**Clinic Supervision Portal:** [https://calm-motion-yoga.vercel.app/clinic](https://calm-motion-yoga.vercel.app/clinic)  
**Clinic Code:** `CALM01`  
**Demo Clinic Admin Passcode:** `CALM2026` (or configured `CLINIC_ADMIN_PASSCODE`)  

---

## 🏷️ Tagline
**Private, on-device motion coaching for mindful yoga and physiotherapy rehabilitation—offline-ready exercise with zero cloud video transmission.**

---

## 📝 100-Word Description
Calm Motion is a mobile-first wellness and rehabilitation application featuring an intelligent Live Motion Coach that operates on-device within the browser. Blending an aesthetic of "Apple Health x Calm x modern physical therapy clinic," it observes movement through the device camera, providing debounced, one-at-a-time voice and visual alignment corrections in English, Hindi, and Telugu. Camera video is processed on the device and is never uploaded. Only summary metrics (reps or hold time, peak ROM, pain scores, form quality) are sent to the clinic when the user has joined a clinic and is online. The app works offline and syncs when back online.

---

## 🌟 5 Key Features

1. **On-Device Live Motion Coach & Skeleton Tracking**  
   Evaluates 33 body keypoints on-device using MediaPipe Pose Landmarker without transmitting camera frames over the network.
2. **Debounced One-at-a-Time Voice & Visual Feedback (EN / HI / TE)**  
   Delivers human, calming guidance (e.g., *"Lower your right shoulder slightly"*) in English, Hindi, and Telugu, holding messages for at least 1.5 seconds to prevent cognitive overload.
3. **Live Range of Motion (ROM) & Clinical Pain-Stop Rule**  
   Calculates joint angles in real time, records peak elevation degrees, and automatically pauses the workout if discomfort reaches the stop threshold (default 5, configurable by therapist).
4. **Offline PWA Architecture with IndexedDB Outbox**  
   Precached offline assets (MediaPipe vision models, WASM runtime, self-hosted fonts, SVGs, audio engine); session reports queue in an offline outbox during airplane mode and auto-sync idempotently when reconnected.
5. **Therapist Supervision Portal (`/clinic`) & PDF Report Generation**  
   Licensed clinicians monitor patient cohorts via 5-second polling, adjust target ROM and allowable pain thresholds remotely, and export comprehensive clinical PDF summaries with one tap.

---

## ⏱️ Test It in 60 Seconds (Judge Fast-Track)

1. **Open the Live App:** Navigate to [https://calm-motion-yoga.vercel.app](https://calm-motion-yoga.vercel.app) on your phone or desktop.
2. **Launch Coaching:** Tap **"Start Session"** on the home screen.
3. **Select Mode:** Choose **"Live Camera"** (for front-camera tracking via MediaPipe) or **"Recorded Replay"** (if testing without a camera). Tap **"I'm Ready"**.
4. **Experience Live Feedback:** Observe the skeleton canvas, live ROM angle reading, and debounced voice cues. Tap **"Pain Check"** to test the safety halt.
5. **Download Report:** Complete the session to view reps and peak ROM, then tap **"Download Session Report (PDF)"** to export your clinical summary.
6. **Inspect Clinic Dashboard:** Open [https://calm-motion-yoga.vercel.app/clinic](https://calm-motion-yoga.vercel.app/clinic) in a new tab. Enter Clinic Code **`CALM01`** and Passcode **`CALM2026`** (default demo passcode) to observe live patient reports, adjust movement protocols, and view clinical notes.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript (Strict Mode), Vite 5, Tailwind CSS, Framer Motion, Lucide Icons, i18next (EN/HI/TE).
- **Edge AI & Pose Engine:** MediaPipe Pose Landmarker (`@mediapipe/tasks-vision`) with local WASM binaries and models, High-DPR Canvas skeleton overlay, biomechanical joint angle trigonometry, Web Speech API speech synthesis, haptics API.
- **Client Persistence & Offline:** Dexie IndexedDB (sessions, pain logs, offline sync outbox), VitePWA Workbox service worker precaching.
- **Backend & Serverless:** Vercel Serverless Functions (`/api/*`) with JWT bearer authentication, MongoDB Atlas integration with in-memory fallback store for local dev, Zod schema validation.
- **Reporting:** Client-side vector PDF generation via `jsPDF`.

---

## ⚖️ Known Limitations & Prototype Boundaries
- **Browser TTS Accents:** Regional language naturalness (Hindi/Telugu) depends on host operating system voices; standard fallback voice is used when Indian language packs are absent on desktop OS.
- **Hardware Acceleration:** Runs via WebGL and WebAssembly in browser context rather than native silicon NPU (Apple Neural Engine), drawing moderate power during extended sessions.
- **Clinical Role:** Serves as an adjuvant rehabilitation adherence and guidance tool; does not provide diagnostic medical claims.

---

## 📱 Mobile Test QR Code
A high-resolution QR code pointing directly to the live URL is saved at `public/qr-live-link.png`.
Scan it on any iOS or Android phone to test live camera tracking, speech synthesis, and offline PWA installation.
