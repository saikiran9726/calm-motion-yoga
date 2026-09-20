# Calm Motion — 3-Minute Hackathon Demo Script for Judges

**Live Link:** `<YOUR_LIVE_URL>`  
**Clinic Portal:** `<YOUR_LIVE_URL>/clinic` (Clinic Code: `CALM01` • Passcode: the value set as `CLINIC_ADMIN_PASSCODE` for the demo deployment, provided to judges privately)  
*Note for Public Demos:* If running a public demo, use a separate demo deployment with `DEMO_MODE=true`, fake data only, and a throwaway passcode (must not hold real patient data).

---

## ⏱️ The 3-Minute Judge Demo Script

### 1. The Problem & Core Insight (0:00 – 0:30)
> *"Over 80% of patients fail to complete physical therapy or maintain safe yoga practice at home because they cannot tell if their form is correct. Yet sending live camera video to the cloud is a medical privacy hazard and computationally expensive.  
> **Calm Motion** solves this with an on-device Live Motion Coach that runs directly in the mobile browser. Camera video is processed on the device and is never uploaded. Only summary metrics (reps or hold time, peak ROM, pain scores, form quality) are sent to the clinic when the user has joined a clinic and is online. It evaluates joint angles in real time, provides debounced one-at-a-time voice guidance in English, Hindi, and Telugu, safeguards against pain, and works offline; syncing when back online."*

---

### 2. Live Motion Coach in Airplane Mode (0:30 – 1:30)
> *(Presenter holds up phone or laptop, demonstrates Airplane Mode or normal connectivity)*
>
> 1. *"Notice the quiet badge at the top: **Works offline**. MediaPipe models, WASM runtimes, fonts, and assets are precached locally."*
> 2. In **Profile**, show how the patient joins clinic code `CALM01`.
> 3. Tap **"Start Session"** → In the setup card, show the **Tracking Source** selector:
>    - *"Judges: You can choose **Live Camera** (using real MediaPipe Vision tracking) or **Recorded Replay** if evaluating in a room without a camera setup."*
> 4. Tap **"I'm Ready"** → Watch the serene **Ready → 3 → 2 → 1 → Start** countdown.
> 5. *"The camera tracks body landmarks with a subtle Soft Sage skeleton. Notice the live Range of Motion (ROM) badge tracking real-time joint degrees and peak ROM."*
> 6. Deliberately raise or drop the shoulder:
>    - The right shoulder joint pulses gently in Soft Coral (`#E9A99A`).
>    - The voice coach gently speaks: *"Lower your right shoulder slightly."*
>    - Rule enforcement: Exactly **ONE** correction at a time, held for at least 1.5 seconds.
> 7. Align the posture: The badge switches to *"Spine aligned"* and the coach acknowledges: *"Good movement."*

---

### 3. Clinical Safeguards: Pain-Stop Rule & PDF Export (1:30 – 2:15)
> 1. Tap the **"Pain Check"** button:
>    - *"During rehabilitation, pain is an immediate stop signal. If a patient reports pain at or above the stop threshold (default 5, configurable per patient by the therapist), our clinical safety rule halts the session immediately."*
> 2. Demonstrate reporting level 5: The session stops gracefully, resting advice plays, and the report is safely recorded as pain-interrupted.
> 3. Complete an exercise session to reach the **Completion Sheet**:
>    - Soft expanding checkmark (no loud gamification).
>    - Shows real measured reps completed, peak ROM, and honest form quality (Good / Needs Attention based on actual compensation rate).
> 4. Tap **"Download Session Report (PDF)"**:
>    - A clean, vector-rendered clinical PDF is instantly generated and downloaded locally with zero external network dependencies.

---

### 4. Clinic Supervision Portal (`/clinic`) & Live Polling (2:15 – 2:45)
> *(Presenter opens the Clinic Portal on another tab or second device)*
>
> 1. Navigate to `/clinic` and enter the passcode: the value set as `CLINIC_ADMIN_PASSCODE` for the demo deployment (provided to judges privately).
> 2. Show the patient cohort: Ananya, Arjun, Priya, Rahul.
> 3. Notice the **Live Connected (5s Polling)** badge:
>    - *"Within 5 to 10 seconds of a session ending on the phone, the clinic portal receives the summary numbers without duplicates (enforced by unique idempotent report IDs)."*
> 4. Click **"Adjust Movement Program"**:
>    - Change the allowable pain threshold and target ROM, then click **"Save & Sync"**.
>    - The updated prescription is fetched by the patient's app on their next session!

---

### 5. Why Privacy & Calm Design Wins (2:45 – 3:00)
> *"Healthcare technology should feel calming, trustworthy, and respectful. By running on-device edge AI in the browser, Calm Motion eliminates server video processing costs, protects patient dignity, and operates even when connectivity is intermittent or completely offline."*

---

## ❓ Top 5 Judge Questions & Winning Answers

### Q1: *"Is this a medical device, and does it provide diagnostic claims?"*
**Answer:**
> *"No. Calm Motion is an adjuvant rehabilitation adherence and movement guidance tool designed to assist licensed physical therapists. We enforce clear non-diagnostic disclaimers across the app: 'This app gives movement guidance and is not a medical diagnosis.' If acute pain or sharp discomfort is detected, our built-in safety rules immediately halt movement."*

---

### Q2: *"Where do the camera video and skeleton images go? How is HIPAA/privacy protected?"*
**Answer:**
> *"Camera video is processed on the device and is never uploaded. Only summary metrics (reps or hold time, peak ROM, pain scores, form quality) are sent to the clinic when the user has joined a clinic and is online. Video frames are captured into an HTML5 VideoElement in local browser memory, evaluated by the local MediaPipe Pose Landmarker, and immediately discarded. Zero photos or video streams are stored or transmitted."*

---

### Q3: *"Does the app truly function with zero internet connection in Airplane Mode?"*
**Answer:**
> *"Yes. The exercise session runs entirely offline once precached. Calm Motion is a Progressive Web App (PWA). All code, MediaPipe Vision models and WASM binaries, Manrope fonts, offline SVGs, and audio engines are precached. If you finish a workout in airplane mode, our IndexedDB offline outbox holds the session report and automatically flushes it to the clinic backend when reconnected."*

---

### Q4: *"How does the app handle different languages and diverse patient populations?"*
**Answer:**
> *"We built full trilingual support for English, Hindi (हिन्दी), and Telugu (తెలుగు) covering both UI copy and the calibrated Voice Coach. The app uses the device's local speech synthesis engine with culturally sensitive, calming coaching cadences."*

---

### Q5: *"How do you test this if a judge doesn't have a camera or is on a restricted device?"*
**Answer:**
> *"We built an explicit judge-friendly 'Recorded Replay' mode right into the session setup screen. Evaluators can experience the full skeleton overlay, real-time ROM angle updates, debounced voice feedback, and completion reports without needing a webcam."*
