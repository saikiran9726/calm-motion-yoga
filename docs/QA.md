# Calm Motion: Quality Assurance & Verification Report

**Deployment URL:** `https://calm-motion-yoga.vercel.app`  
**Test Viewports:** Mobile First (390 x 844, 360 x 800) & Desktop  
**Build & Typecheck:** `npm run typecheck` (0 errors), `npm run build` (0 errors)  
**Automated Tests:** `npm test` (41 unit & integration tests passing in Vitest), `node scripts/test-offline-pwa.mjs` (passing)  

---

## 1. Automated Test Commands

Run the following test commands locally:
```bash
# 1. Typecheck (TypeScript compiler in strict mode)
npm run typecheck

# 2. Unit tests (Vitest suite covering exercise engine, geometry, rules, rep counter, hold accumulator, feedback arbiter, backend auth & rate limiting)
npm test

# 3. Production build (Vite + VitePWA build with model/WASM precaching)
npm run build

# 4. Headless Chrome PWA Offline Precaching Test
node scripts/test-offline-pwa.mjs
```

---

## 2. Feature Status & Verification Evidence Matrix

| # | Feature Area | Status | Evidence | Notes |
|---|---|---|---|---|
| 1 | **Onboarding Flow** | Verified | Verified in browser | 3-step setup (`/onboarding`): Language (EN/HI/TE), Goals, Camera check. |
| 2 | **Home & Check-in** | Verified | Verified in browser | Feeling check-in (Great/Okay/Sore), Today's Session, consistency ring. |
| 3 | **Explore & Sanctuary** | Verified | Verified in browser | Category filter chips, yoga sanctuary poses, physio tracks. |
| 4 | **Exercise Engine Geometry** | Verified | Unit tested (`src/engine/exercises/geometry.test.ts`) | Vector angle calculation, torso normalization, spine tilt. |
| 5 | **Repetition Counter** | Verified | Unit tested (`src/engine/exercises/repCounter.test.ts`) | Dynamic inflection, partial rep rejection, min duration. |
| 6 | **Hold Accumulator** | Verified | Unit tested (`src/engine/exercises/holdAccumulator.test.ts`) | Accumulates time within tolerance; resets/pauses outside. |
| 7 | **Feedback Arbiter** | Verified | Unit tested (`src/engine/exercises/feedbackArbiter.test.ts`) | Single highest-priority cue, debounced 1.5s minimum hold. |
| 8 | **Camera Stream Lifecycle** | Verified | Verified in browser; Not verified on a real device | Stable `useCameraStream` hook, error recovery, unmount cleanup. |
| 9 | **MediaPipe Pose Tracking** | Verified | Verified in browser; Not verified on a real device | PoseLandmarker initialized with local WASM & model; live keypoints. |
| 10 | **Recorded Replay Fallback** | Verified | Verified in browser | Mock JSON replay pose source for testing without camera. |
| 11 | **Multilingual Voice Coach** | Verified | Verified in browser; Not verified on a real device | Browser SpeechSynthesis in EN, HI, TE; fallback to visual text. |
| 12 | **Voice Pain Check-in** | Verified | Verified in browser | Interactive pain check-in dialog with slider and speech cues. |
| 13 | **Pain-Stop Safety Rule** | Verified | Verified in browser & Unit tested | Halts session when pain reaches threshold (default 5, configurable). |
| 14 | **Range of Motion (ROM)** | Verified | Unit tested & Verified in browser | Live joint angle calculation and peak ROM tracking. |
| 15 | **PDF Session Report** | Verified | Verified in browser | Vector PDF generation with metadata, reps, peak ROM via jsPDF. |
| 16 | **Clinic Join & Leave** | Verified | Verified in browser (`/api/patient/join`) | Patient registers with clinic code `CALM01`, receives patientToken. |
| 17 | **Program Prescription Sync** | Verified | Verified in browser (`/api/patient/program`) | Fetches therapist prescribed exercises, pain threshold, and targets. |
| 18 | **Offline PWA Precaching** | Verified | Verified via `test-offline.cjs` & Workbox | 66 precached assets including models, WASM, fonts, and PNG icons. |
| 19 | **Offline Outbox Queue** | Verified | Verified in browser | Failed `/api/reports` queue in Dexie IndexedDB; flushes when online. |
| 20 | **Clinic Dashboard Auth** | Verified | Verified in browser (`/api/clinic/auth`) | Password-protected (`CLINIC_ADMIN_PASSCODE` / `CALM2026`), issues clinicToken JWT. |
| 21 | **Therapist Dashboard & Polling**| Verified | Verified in browser (`/clinic`) | 5s polling, patient cohort list, program adjustment editor. |
| 22 | **Delete My Data** | Verified | Verified in browser (`/api/patient/delete-data`) | Purges patient data from server and local Dexie IndexedDB. |

---

## 3. Manual Test Checklist for a Real Phone

Because physical smartphone hardware (front camera sensors, physical touch latency, mobile OS audio ducks, real battery controllers) cannot be fully simulated in desktop headless environments, use this 9-step checklist to verify on a real device:

1. **Open on Mobile Browser:** Navigate to `https://calm-motion-yoga.vercel.app` (or your local network HTTPS address) on Chrome (Android) or Safari (iOS).
2. **Camera Permission Grant:** Tap "Start Session" -> Grant camera permissions when prompted. Verify front camera video starts mirrored and smoothly without layout shift.
3. **Live Pose Tracking:** Step back ~2 meters until full body is in frame. Verify the Soft Sage skeleton overlays your joints and joint angle updates live as you move.
4. **Voice Audio Playback:** Ensure phone ringer/silent switch is unmuted. Perform an intentional misalignment (e.g., lower shoulder) and verify calm speech cue plays through speaker.
5. **Pain-Stop Safety Trigger:** Tap "Pain Check", set pain to 5 or higher (or say "Pain 6"). Verify session halts immediately with resting instructions.
6. **Session Report & PDF Download:** Complete a session (or trigger pain-stop), tap "Download Session Report (PDF)". Verify PDF opens/saves in phone downloads.
7. **Clinic Association:** Open "Profile", enter Clinic Code `CALM01`, and tap "Join Clinic". Verify status shows "Connected to Clinic CALM01".
8. **Offline Airplane Mode Exercise:** Turn on Airplane Mode (disconnect Wi-Fi and Cellular). Launch an exercise session, complete it, and check that it saves to the offline outbox. Turn off Airplane Mode and verify the outbox flushes.
9. **Clinic Portal Verification:** Open `/clinic` on a second device or tab, enter passcode `CALM2026`, and verify the patient's new session report is visible in the cohort view.

---

## 4. Transparent Engineering Boundaries
1. **SpeechSynthesis Regional Voice Support:**  
   The Web Speech API depends on OS-installed voice models. On Android and iOS devices with regional language packs, Hindi and Telugu speech sounds natural. If the host device lacks regional voices, text cues remain fully visible on-screen.
2. **Browser Execution vs. Native Silicon NPU:**  
   Pose estimation runs in the browser sandbox using MediaPipe WebAssembly and WebGL shaders rather than native NPU neural engines.
3. **Non-Diagnostic Adjuvant Tool:**  
   Calm Motion is a movement coach and rehabilitation adherence tool designed to assist licensed physical therapists. It provides motion feedback and does not replace professional medical diagnostics.
