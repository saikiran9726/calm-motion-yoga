# Calm Motion: QA Feature Audit & Status Matrix

**Date of Audit:** September 19, 2026  
**Viewport Evaluated:** Mobile First (390 x 844, 360 x 800) & Desktop  
**Build Status:** `tsc && vite build` Passed with 0 errors (Vite v5.4, PWA Workbox v0.20.5 generated).

---

## 1. Feature Status Matrix

| # | Feature Area | Status | Audit Findings & Gap Analysis |
|---|---|---|---|
| 1 | **Onboarding** | **PASS** | 3-step responsive flow at `/onboarding`: language selection (EN, HI, TE), goal selection (Yoga, Physio, Both), camera permission with full "Camera Denied" 3-step recovery guide. |
| 2 | **Home Screen** | **PASS** | Dynamic time-of-day greeting, feeling check-in (Great, Okay, Sore) with restorative recommendation on "Sore", Today's Session hero card with 2-tap exercise launch, 72% consistency ring, Mon-Sun checkmarks, and offline status badge. |
| 3 | **Explore Screen** | **PASS** | 6 category filter chips, peaceful Yoga Sanctuary cards with inline SVG illustrations, and structured clinical Physiotherapy tracks. |
| 4 | **Yoga Pose Detail** | **PASS** | 8 complete poses, animated breathing circle (4-2-4 cadence), interactive alignment overlay toggle, alignment tips, and "Start Motion Tracking" button. |
| 5 | **Physio Recovery** | **PASS** | Shoulder Mobility & Knee Strength tracks, 6-week timeline, checklist with interactive tips, 0-10 pain slider, and clear non-diagnostic clinical disclaimer. |
| 6 | **Progress Screen** | **PASS** | 78% weekly consistency ring, sessions (5/6), exercises (31), streak (8d), 3-step shoulder mobility progression (62° -> 78° -> 95°), and reviewer state toggles. |
| 7 | **Profile / You** | **PASS** | Avatar, user name, goals, active program card, connected therapist, language selector, morning reminder toggle, camera privacy sheet, and local data reset. |
| 8 | **Live Camera Tracking** | **PARTIAL** | Web camera stream is requested and mirrored in background, but landmark detection currently relies on `MockPoseSource` replay loop. Needs hybrid live camera tracking + explicit recorded-movement fallback. |
| 9 | **Rep Counting** | **PASS** | Automatic rep increments up to 10 with subtle progress bar, tactile haptics (`navigator.vibrate`), and audio triggers. |
| 10 | **One-at-a-Time Corrections** | **PASS** | Debounced coaching controller guarantees minimum 1.5s display, strictly one correction at a time, highlighted joint in Soft Coral (`#E9A99A`), and accessible icon + text. |
| 11 | **Voice Cues (EN/HI/TE)** | **PARTIAL** | `VoiceCoach` skeleton exists in `src/engine/voice/index.ts` using Web Speech API, but language translation and live triggers in session are not fully integrated. |
| 12 | **Voice Pain Check-in** | **MISSING** | Audio/voice prompt asking user for pain level or verbal check-in during/after exercise is not yet implemented. |
| 13 | **Pain-Stop Rule** | **MISSING** | Clinical safety rule (if pain >= 5 or acute discomfort reported, immediately halt movement and offer restorative guidance) is missing. |
| 14 | **Range of Motion (ROM)** | **PARTIAL** | Historical degrees displayed in progress view (62°->78°->95°), but live ROM calculation during exercise and in session reports is missing. |
| 15 | **Session Report PDF** | **MISSING** | Post-session exportable PDF summary (reps, accuracy, range of motion, pain rating, therapist notes) is missing. |
| 16 | **Adaptive Plan** | **PARTIAL** | Basic adaptation exists when "Sore" is toggled on Home screen, but dynamic algorithmic adjustment of reps/targets based on pain and ROM is missing. |
| 17 | **Therapist Mode** | **PARTIAL** | Clinical view exists at `/therapist` with patient list and program adjustment sheet, but currently uses mock in-memory state disconnected from backend. |
| 18 | **Hosted Backend Sync** | **MISSING** | Vercel serverless API functions (`/api/*`), MongoDB Atlas integration, and data sync are not yet built. |
| 19 | **Clinic Dashboard** | **MISSING** | Dedicated `/clinic` dashboard with passcode login (6-char clinic code), patient join, 5-second polling, "New report received" toast, program editor, and demo seed loader is missing. |
| 20 | **Offline Mode (Airplane Mode)**| **PARTIAL** | Service worker and PWA precaching bundle all assets, fonts, and SVGs for 100% offline usage; however, an IndexedDB offline outbox with online auto-sync retry is missing. |
| 21 | **Demo Mode** | **MISSING** | Judge-friendly welcome sheet ("Try live coaching" / "Watch quick demo"), "About this prototype" page, and one-tap demo data loader are missing. |
| 22 | **Recorded-Movement Fallback** | **PARTIAL** | Keyframe simulation exists in code (`mockPoseReplay.json`), but judges without a webcam have no prominent, one-tap "Replay Recorded Movement" selector in session setup. |
| 23 | **Delete My Data** | **PARTIAL** | Client-side IndexedDB & store wiping implemented in Profile; requires backend endpoint sync to purge cloud clinic records when online. |

---

## 2. Summary of Audit Findings
- **Total Features Evaluated:** 23
- **PASS:** 7 (30.4%)
- **PARTIAL:** 8 (34.8%)
- **MISSING:** 8 (34.8%)
- **FAIL:** 0 (0.0%)

## 3. Action Plan for Step 2 (Fix and Complete)
1. **Backend & Clinic Dashboard:**
   - Create Vercel Serverless API (`api/` endpoints) with MongoDB Atlas connection & fallback local JSON store for dev.
   - Endpoints: `/api/clinic/auth`, `/api/clinic/patients`, `/api/clinic/program`, `/api/reports`, `/api/delete-data`, `/api/seed`.
   - Build `/clinic` dashboard with passcode login, 6-character clinic code, 5s polling, "New report received" toast, program modification, and notes.
2. **Offline Outbox (Dexie IndexedDB):**
   - Outbox table that queues session reports offline and syncs idempotently when `navigator.onLine` fires.
3. **Live Camera & Recorded-Movement Fallback:**
   - Dedicated toggle in PreSessionSetupCard: "Camera (Live Tracking)" vs "Replay Recorded Movement".
   - Bundled MediaPipe / on-device landmark tracker with fast fallback to realistic movement replay.
4. **Voice Engine (EN/HI/TE) & Voice Pain Check-in:**
   - Calibrated SpeechSynthesis with multilingual phrases for English, Hindi, and Telugu.
   - Post-exercise voice pain check-in ("How was your pain on a scale of 0 to 10?") with verbal & tap responses.
5. **Pain-Stop Rule:**
   - Active monitoring: If user reports pain >= 5, session immediately halts with soothing advice and clinical safety notes.
6. **Live Range of Motion (ROM):**
   - Calculate joint angles (e.g., shoulder elevation, knee flexion) in real-time and display peak ROM achieved.
7. **Session Report PDF Generation:**
   - Client-side zero-dependency / lightweight SVG/Canvas/print PDF generator producing clinical summary sheets.
8. **Judge Welcome & Prototype Transparency:**
   - Judge-friendly welcome modal ("Try live coaching" / "Watch quick demo").
   - "About this prototype" sheet explaining on-device privacy, local processing, and current hardware capabilities.
