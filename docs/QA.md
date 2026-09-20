# Calm Motion: Quality Assurance & Verification Report

**Deployment URL:** `<YOUR_LIVE_URL>`  
**Test Viewports:** Mobile First (390 x 844, 360 x 800) & Desktop  
**Build & Typecheck:** `npm run typecheck` (0 errors), `npm run build` (0 errors)  
**Automated Tests:** `npm test` (58 unit & integration tests passing across 5 test suites), `node scripts/test-offline-pwa.mjs` (passing in Replay mode)  

---

## 1. Automated Test Commands

Run the following verified test commands locally:
```bash
# 1. Typecheck (TypeScript compiler in strict mode across client and API)
npm run typecheck

# 2. Unit & Integration tests (Vitest suite covering exercise engine, fail-closed tracking, security, outbox, and clinic sync)
npm test

# 3. Production build (Vite + VitePWA build with model/WASM precaching)
npm run build

# 4. Headless Chrome PWA Offline Precaching Test (Replay mode)
node scripts/test-offline-pwa.mjs
```

---

## 2. Feature Status & Verification Evidence Matrix

*Note on Statuses:* Per strict QA rules, every status is restricted to: `Unit tested`, `Verified in headless browser (Replay mode)`, `Not verified on a real device`, or `Not verified`. Every evidence path refers to an existing test or source file in the repository.

| # | Feature Area | Status | Evidence | Verification Notes |
|---|---|---|---|---|
| 1 | **Onboarding Flow** | Verified in headless browser (Replay mode) | `scripts/test-all-features.js` | 3-step setup (`/onboarding`): Language (EN/HI/TE), Goals, Camera check. |
| 2 | **Home & Check-in** | Verified in headless browser (Replay mode) | `scripts/test-all-features.js` | Feeling check-in (Great/Okay/Sore), Today's Session, consistency ring. |
| 3 | **Explore & Sanctuary** | Verified in headless browser (Replay mode) | `scripts/test-all-features.js` | Category filter chips, yoga sanctuary poses, physio tracks. |
| 4 | **Exercise Engine Geometry** | Unit tested | `src/engine/__tests__/exerciseEngine.test.ts` | 2D/3D joint angle calculation, spine tilt, torso normalization. |
| 5 | **Repetition Counter** | Unit tested | `src/engine/__tests__/exerciseEngine.test.ts` | Peak inflection detection, partial rep rejection, hysteresis. |
| 6 | **Hold Accumulator** | Unit tested | `src/engine/__tests__/exerciseEngine.test.ts` | Accumulates time within tolerance; pauses outside; tracks body sway. |
| 7 | **Feedback Arbiter** | Unit tested | `src/engine/__tests__/exerciseEngine.test.ts` | Highest-priority cue selection, 1.5s minimum debounce hold. |
| 8 | **Fail-Closed Pose Gate** | Unit tested | `src/engine/__tests__/failClosedTracking.test.ts` | Empty keypoints or non-tracking state freezes timer, ROM, and rep progression. |
| 9 | **Camera Stream Lifecycle** | Not verified on a real device | `src/hooks/useCameraStream.ts` | Stable hook, error recovery, unmount cleanup. Physical mobile camera lifecycle not verified. |
| 10 | **MediaPipe Pose Tracking** | Not verified on a real device | `src/engine/pose/MediaPipePoseSource.ts` | Model and WASM load and initialise; tracking a real person is NOT verified (needs the phone checklist). |
| 11 | **Recorded Replay Mode** | Verified in headless browser (Replay mode) | `scripts/test-offline-pwa.mjs` | Replays recorded pose frames for verification without camera. |
| 12 | **Multilingual Voice Coach** | Not verified on a real device | `src/engine/voice/index.ts` | Web Speech API speech synthesis in EN, HI, TE; phone OS regional voice output not verified. |
| 13 | **Voice Pain Check-in** | Not verified on a real device | `src/hooks/useVoicePainInput.ts` | Web Speech recognition and touch slider for pain reporting. |
| 14 | **Pain-Stop Safety Rule** | Unit tested | `src/engine/__tests__/exerciseEngine.test.ts` | Halts exercise when pain reaches patient threshold (default 5). |
| 15 | **Range of Motion (ROM)** | Unit tested | `src/engine/__tests__/exerciseEngine.test.ts` | Real-time joint degree computation and peak ROM tracking. |
| 16 | **PDF Session Report** | Not verified on a real device | `src/lib/reportPdf.ts` | Vector PDF generation via jsPDF. Physical mobile download/viewer not verified. |
| 17 | **Clinic Join & Patient Auth** | Unit tested | `api/__tests__/security.test.ts`, `api/__tests__/clinicSyncAndBootstrap.test.ts` | Patient registers with clinic code `CALM01`, receives patientToken. |
| 18 | **Program Prescription Sync** | Unit tested | `src/engine/__tests__/outboxAndProgram.test.ts`, `api/__tests__/security.test.ts` | Fetches therapist prescribed exercises, pain threshold, and targets. |
| 19 | **Sync Payload Contract** | Unit tested | `api/__tests__/clinicSyncAndBootstrap.test.ts` | `buildSyncPayload` produces strict schema-adherent payload, strips client-only properties. |
| 20 | **Offline PWA Precaching** | Verified in headless browser (Replay mode) | `scripts/test-offline-pwa.mjs` | Model and WASM are served from the Service Worker cache while offline in headless Chrome; offline tracking with a real camera NOT verified. |
| 21 | **Offline Outbox Queue** | Unit tested | `src/engine/__tests__/outboxAndProgram.test.ts` | Exponential backoff, non-retryable 400 failure handling, and retry reset. |
| 22 | **Production Clinic Bootstrap**| Unit tested | `api/__tests__/clinicSyncAndBootstrap.test.ts` | Auto-bootstraps `CALM01` into empty MongoDB collection using `CLINIC_ADMIN_PASSCODE`. |
| 23 | **Placeholder Secret Rejection**| Unit tested | `api/__tests__/clinicSyncAndBootstrap.test.ts` | Rejects placeholder `JWT_SECRET` and `CLINIC_ADMIN_PASSCODE` in production with HTTP 503. |
| 24 | **Rate Limiting (Login & Join)**| Unit tested | `api/__tests__/clinicSyncAndBootstrap.test.ts` | Counts failed logins only, resets on success, enforces 20 global cap, and caps join at 10/hr. |
| 25 | **Therapist Dashboard & Polling**| Verified in headless browser (Replay mode) | `scripts/test-all-features.js` | 5s polling, patient cohort view, program adjustment editor. |
| 26 | **Delete My Data (GDPR/HIPAA)**| Unit tested | `api/__tests__/security.test.ts` | Purges patient records from server and local Dexie database. |

---

## 3. Manual Test Checklist for a Real Phone

Because physical smartphone hardware (front camera sensors, physical touch latency, mobile OS audio ducks, real battery controllers) cannot be fully simulated in desktop headless environments, use this 9-step checklist to verify on a real device:

1. **Open on Mobile Browser:** Navigate to `<YOUR_LIVE_URL>` (or your local network HTTPS address) on Chrome (Android) or Safari (iOS).
2. **Camera Permission Grant:** Tap "Start Session" -> Grant camera permissions when prompted. Verify front camera video starts mirrored and smoothly without layout shift.
3. **Live Pose Tracking:** Step back ~2 meters until full body is in frame. Verify the Soft Sage skeleton overlays your joints and joint angle updates live as you move.
4. **Voice Audio Playback:** Ensure phone ringer/silent switch is unmuted. Perform an intentional misalignment (e.g., lower shoulder) and verify calm speech cue plays through speaker.
5. **Pain-Stop Safety Trigger:** Tap "Pain Check", set pain to 5 or higher (or say "Pain 6"). Verify session halts immediately with resting instructions.
6. **Session Report & PDF Download:** Complete a session (or trigger pain-stop), tap "Download Session Report (PDF)". Verify PDF opens/saves in phone downloads.
7. **Clinic Association:** Open "Profile", enter Clinic Code `CALM01`, and tap "Join Clinic". Verify status shows "Connected to Clinic CALM01".
8. **Offline Airplane Mode Exercise:** Turn on Airplane Mode (disconnect Wi-Fi and Cellular). Launch an exercise session, complete it, and check that it saves to the offline outbox. Turn off Airplane Mode and verify the outbox flushes.
9. **Clinic Portal Verification:** Open `/clinic` on a second device or tab, enter the configured `CLINIC_ADMIN_PASSCODE` (provided privately), and verify the patient's new session report is visible in the cohort view.

---

## 4. Transparent Engineering Boundaries
1. **SpeechSynthesis Regional Voice Support:**  
   The Web Speech API depends on OS-installed voice models. On Android and iOS devices with regional language packs, Hindi and Telugu speech sounds natural. If the host device lacks regional voices, text cues remain fully visible on-screen.
2. **Browser Execution vs. Native Silicon NPU:**  
   Pose estimation runs in the browser sandbox using MediaPipe WebAssembly and WebGL shaders rather than native NPU neural engines.
3. **Non-Diagnostic Adjuvant Tool:**  
   Calm Motion is a movement coach and rehabilitation adherence tool designed to assist licensed physical therapists. It provides motion feedback and does not replace professional medical diagnostics.
