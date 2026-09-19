# Calm Motion — 3-Minute Hackathon Demo Script for Judges

Use this script to deliver a calm, confident, and high-impact presentation at the hackathon.

---

## ⏱️ The 3-Minute Presentation Walkthrough

### 1. The Problem (0:00 – 0:30)
> *"Over 80% of patients fail to complete physical therapy or maintain safe yoga practice at home because they don't know if their posture is correct, yet sending live video to the cloud violates patient privacy and requires expensive servers. Today, we're introducing **Calm Motion**: the first privacy-first, on-device motion coach that runs entirely in your mobile browser with zero cloud dependencies."*

---

### 2. Live Demo in Airplane Mode (0:30 – 1:30)
> *(Presenter holds up the phone, swipes down control center, and turns on **Airplane Mode**)*
>
> 1. *"Notice the quiet badge at the top: **Works offline**. We are completely in Airplane Mode—no Wi-Fi, no mobile data."*
> 2. Tap **"Start Session"** → Tap **"Begin Live Motion Coach"** → Tap **"I'm Ready"**.
> 3. Watch the soothing **Ready → 3 → 2 → 1 → Start** countdown.
> 4. *"The camera observes my movement. Notice the Soft Sage skeleton aligning to my joints."*
> 5. *(Demonstrate a deliberate compensation: raise or drop one shoulder)*
> 6. Hear the coach speak and see the debounced coaching banner appear:
>    > *"Lower your right shoulder slightly."*
> 7. Notice the right shoulder joint pulse with a calm Soft Coral accent circle.
> 8. Re-align the shoulder: the check badge switches to *"Spine aligned"* and the coach acknowledges: *"Good movement."*

---

### 3. Proof of On-Device Speed (1:30 – 2:00)
> *(Presenter taps the **"LIVE COACH"** emerald badge at the top)*
>
> 1. *"Judges, how do we know this isn't sending video to a backend? Let's open our live hardware metrics panel."*
> 2. Show the screen to the judges:
>    - **Frame Rate**: `29.8 FPS`
>    - **Inference Time**: `22 ms / frame`
>    - **Hardware Delegate**: `GPU (WebGL)`
>    - **Network State**: `Offline (Airplane Mode)`
>    - **Battery & Memory**: Real-time readings
> 3. *"Everything is running right here on the phone's GPU in volatile memory. No video ever leaves this device."*

---

### 4. Completion, Clinical Safety & Laptop Sync (2:00 – 2:40)
> 1. Tap **"Next Movement"** to trigger session completion.
> 2. Show the calming expanding checkmark animation (no loud confetti).
> 3. *"We see 10/10 reps completed, Form Quality: 'Excellent', and an encouraging recovery summary."*
> 4. Tap **"Generate Clinical Report"** → An offline clinical PDF is generated instantly in the browser.
> 5. Show how the report syncs over local Wi-Fi or via QR code to the therapist's clinic laptop bridge:
>    - The clinic laptop dashboard immediately updates with the patient's Range of Motion (ROM), reps, and compensations.

---

### 5. Why On-Device & Privacy Matters (2:40 – 3:00)
> *"Healthcare at home only works when patients trust it. By running MediaPipe and biomechanical intelligence entirely on the client, Calm Motion eliminates cloud infrastructure costs, operates in rural areas with zero internet, and delivers absolute medical privacy."*

---

## ❓ Top 5 Judge Questions & Winning Answers

### Q1: *"Is this a medical device, and does it provide diagnostic claims?"*
**Answer:**
> *"No. Calm Motion is designed strictly for **movement guidance and posture tracking**, not medical diagnosis. We enforce a prominent non-diagnostic disclaimer across all clinical views: 'This app gives movement guidance and is not a medical diagnosis. Stop if you feel sharp pain.' Furthermore, if a user reports pain of 7 or above or sharp discomfort, our built-in safety rules immediately halt the session and advise resting and contacting their licensed physiotherapist."*

---

### Q2: *"Where does the video stream go, and how is patient privacy protected?"*
**Answer:**
> *"Nowhere. Video frames are captured directly into an HTML5 VideoElement in browser memory, passed directly to the WebAssembly/GPU MediaPipe pipeline, and discarded immediately after joint extraction. We store **only summary metrics** (e.g. rep counts, peak ROM angles, form score percentages) in local IndexedDB storage. Video frames and raw camera images are never stored, saved, or transmitted."*

---

### Q3: *"Does the app truly function with zero internet connection?"*
**Answer:**
> *"Yes, 100%. Calm Motion is an advanced Progressive Web App. On first visit, the service worker precaches all code, self-hosted Manrope fonts, offline SVG graphics, and the 5.7 MB pose landmarker model. You can turn on Airplane Mode, restart the phone, launch Calm Motion from the home screen icon, and conduct full workouts without a single network packet."*

---

### Q4: *"How do you handle different body proportions, heights, and camera angles?"*
**Answer:**
> *"Our geometry engine normalizes all spatial measurements relative to body size. Distances are calculated as ratios of torso height (shoulder-to-hip distance) rather than fixed pixel dimensions. Additionally, our pre-session card provides inline visual guidance ensuring the phone is propped ~2 meters away with full body visibility."*

---

### Q5: *"How does the physiotherapist interact with the patient without cloud storage?"*
**Answer:**
> *"Calm Motion supports two privacy-preserving offline channels: peer-to-peer QR code scanning and local network HTTP/WebSocket synchronization. When the patient visits the clinic or connects to the clinic Wi-Fi, their summary report syncs directly to the therapist's laptop dashboard without ever touching external cloud servers."*
