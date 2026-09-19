# Calm Motion — 3-Minute Hackathon Demo Script for Judges

**Live Link:** `https://calm-motion-yoga.vercel.app`  
**Clinic Portal:** `https://calm-motion-yoga.vercel.app/clinic` (Passcode: `CALM2026` • Clinic Code: `CALM01`)

---

## ⏱️ The 3-Minute Judge Demo Script

### 1. The Problem & Core Insight (0:00 – 0:30)
> *"Over 80% of patients fail to complete physical therapy or maintain safe yoga practice at home because they cannot tell if their form is correct. Yet sending live camera video to the cloud is a medical privacy hazard and computationally expensive.  
> **Calm Motion** solves this with an on-device Live Motion Coach that runs directly in the mobile browser. It evaluates joint angles in real time, provides debounced one-at-a-time voice guidance in English, Hindi, and Telugu, safeguards against pain, and syncs summary progress to their physical therapist—without a single video frame ever leaving the phone."*

---

### 2. Live Motion Coach in Airplane Mode (0:30 – 1:30)
> *(Presenter holds up phone or laptop, demonstrates Airplane Mode or normal connectivity)*
>
> 1. *"Notice the quiet badge at the top: **Works offline**. All models, fonts, and assets are bundled locally."*
> 2. Tap **"Start Session"** → In the setup card, show the **Tracking Source** selector:
>    - *"Judges: You can choose **Live Camera** or **Recorded Replay** if evaluating in a room without a camera setup."*
> 3. Tap **"I'm Ready"** → Watch the serene **Ready → 3 → 2 → 1 → Start** countdown.
> 4. *"The camera tracks body landmarks with a subtle Soft Sage skeleton. Notice the live Range of Motion (ROM) badge reading **88° (Peak: 94°)**."*
> 5. Deliberately raise or drop the shoulder:
>    - The right shoulder joint pulses gently in Soft Coral (`#E9A99A`).
>    - The voice coach gently speaks: *"Lower your right shoulder slightly."*
>    - Rule enforcement: Exactly **ONE** correction at a time, held for at least 1.5 seconds.
> 6. Align the posture: The badge switches to *"Spine aligned"* and the coach acknowledges: *"Good movement."*

---

### 3. Clinical Safeguards: Pain-Stop Rule & PDF Export (1:30 – 2:15)
> 1. Tap the **"Pain Check"** button:
>    - *"During rehabilitation, pain is an immediate stop signal. If a patient reports pain of 5 or higher, our clinical safety rule halts the session immediately."*
> 2. Demonstrate reporting level 5: The session stops gracefully, resting advice plays, and the report is safely recorded as pain-interrupted.
> 3. Complete the exercise to reach the **Completion Sheet**:
>    - Soft expanding checkmark (no loud gamification).
>    - Reps: 10/10, Peak ROM: 94°, Form Quality: Excellent.
> 4. Tap **"Download Session Report (PDF)"**:
>    - A clean, vector-rendered clinical PDF is instantly generated and downloaded with zero cloud dependencies.

---

### 4. Clinic Supervision Portal (`/clinic`) & Live Polling (2:15 – 2:45)
> *(Presenter opens the Clinic Portal on another tab or second device)*
>
> 1. Navigate to `/clinic` and enter passcode **`CALM2026`** (Clinic Code: `CALM01`).
> 2. Show the patient cohort: Ananya, Arjun, Priya, Rahul.
> 3. Notice the **Live Connected (5s Polling)** badge:
>    - *"Within 5 to 10 seconds of a session ending on the phone, the clinic portal receives the summary numbers without duplicates (enforced by unique idempotent report IDs)."*
> 4. Click **"Adjust Movement Program"**:
>    - Change the allowable pain threshold and target ROM, then click **"Save & Sync"**.
>    - The new prescription reaches the patient's mobile app immediately on their next session!

---

### 5. Why Privacy & Calm Design Wins (2:45 – 3:00)
> *"Healthcare technology should feel calming, trustworthy, and respectful. By running 100% on-device edge AI in the browser, Calm Motion eliminates server video processing costs, protects patient dignity, and operates even in remote clinics with zero internet."*

---

## ❓ Top 5 Judge Questions & Winning Answers

### Q1: *"Is this a medical device, and does it provide diagnostic claims?"*
**Answer:**
> *"No. Calm Motion is an adjuvant rehabilitation adherence and movement guidance tool designed to assist licensed physical therapists. We enforce clear non-diagnostic disclaimers across the app: 'This app gives movement guidance and is not a medical diagnosis.' If acute pain or sharp discomfort is detected, our built-in safety rules immediately halt movement."*

---

### Q2: *"Where do the camera video and skeleton images go? How is HIPAA/privacy protected?"*
**Answer:**
> *"Nowhere. Video frames are captured directly into an HTML5 VideoElement in browser memory, evaluated on the local GPU, and immediately discarded after landmark extraction. Zero photos or video streams are stored or uploaded. Only clinical summary numbers (reps completed, peak ROM in degrees, pain rating) are stored in local IndexedDB and synced to the clinic portal."*

---

### Q3: *"Does the app truly function with zero internet connection in Airplane Mode?"*
**Answer:**
> *"Yes, 100%. Calm Motion is a Progressive Web App (PWA). All code, Manrope fonts, offline SVGs, and audio engines are precached. If you finish a workout in airplane mode, our IndexedDB offline outbox holds the session report and automatically flushes it to the clinic backend when reconnected."*

---

### Q4: *"How does the app handle different languages and diverse patient populations?"*
**Answer:**
> *"We built full trilingual support for English, Hindi (हिन्दी), and Telugu (తెలుగు) covering both UI copy and the calibrated Voice Coach. The app uses the device's local speech synthesis engine with culturally sensitive, calming coaching cadences."*

---

### Q5: *"How do you test this if a judge doesn't have a camera or is on a restricted device?"*
**Answer:**
> *"We built an explicit judge-friendly 'Recorded Replay' mode right into the session setup screen. Evaluators can experience the full skeleton overlay, real-time ROM angle updates, debounced voice feedback, and completion reports without needing a webcam."*
