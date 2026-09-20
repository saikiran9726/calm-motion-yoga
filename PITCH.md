# Calm Motion — Pitch & Slide Deck Notes

---

## 🏷️ One-Line Tagline
> **"Intelligent movement guidance that lives on your phone, never in the cloud."**

---

## ⏱️ 30-Second Elevator Pitch
> *"Physiotherapy and yoga at home suffer from an 80% dropout rate because patients are afraid of bad form or reinjury, yet uploading home camera feeds compromises patient privacy. **Calm Motion** solves this with an on-device AI motion coach that runs in the mobile browser. Camera video is processed on the device and is never uploaded. Only summary metrics (reps or hold time, peak ROM, pain scores, form quality) are sent to the clinic when the user has joined a clinic and is online. It gives gentle real-time voice corrections, measures Range of Motion, works offline; syncing when back online, and speaks English, Hindi, and Telugu."*

---

## 📑 5 High-Impact Slide Bullet Points

1. **On-Device Edge Intelligence**
   - High-precision 33-point body tracking running on client GPU/WebGL with One Euro signal smoothing.
   - Zero video upload—camera frames are evaluated in local browser memory and immediately discarded.

2. **Soothing, Non-Intimidating Coaching**
   - Single-cue debounced feedback (*"Lower your right shoulder slightly"*), calm natural pacing, and zero gamified confetti noise.
   - Multilingual voice synthesis & voice pain check-in in English, Hindi (हिन्दी), and Telugu (తెలుగు).

3. **Clinical Physiotherapy Intelligence**
   - Automated Range of Motion (ROM) progression tracking with recovery trajectory.
   - Built-in clinical safety rules: Immediate session halt if pain reaches the stop threshold (default 5, configurable by therapist) or sharp pain is reported.

4. **Privacy-First & Offline Resilience**
   - PWA architecture with full local precaching of models and WASM: Exercise sessions run completely in Airplane Mode.
   - Volatile camera processing: Camera video is never uploaded; only summary metrics store locally and sync when online.

5. **Therapist Supervision & Resilient Clinic Sync**
   - Authenticated clinic sync via REST API with JWT tokens and local IndexedDB offline outbox queue.
   - Instant offline PDF clinical session report generation for patients and therapists.
