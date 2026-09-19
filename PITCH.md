# Calm Motion — Pitch & Slide Deck Notes

---

## 🏷️ One-Line Tagline
> **"Intelligent movement guidance that lives on your phone, never in the cloud."**

---

## ⏱️ 30-Second Elevator Pitch
> *"Physiotherapy and yoga at home suffer from an 80% dropout rate because patients are afraid of bad form or reinjury, yet uploading home camera feeds to AI clouds compromises patient privacy. **Calm Motion** solves this with an on-device AI motion coach that runs 100% in the mobile browser. It gives gentle real-time voice corrections, measures Range of Motion, and safeguards patient data with zero cloud servers. It works completely in Airplane Mode, speaks English, Hindi, and Telugu, and syncs directly to the clinic laptop over local Wi-Fi."*

---

## 📑 5 High-Impact Slide Bullet Points

1. **On-Device Edge Intelligence (30 FPS)**
   - High-precision 33-point body tracking running on client GPU/WebGL with One Euro signal smoothing.
   - Zero video upload or server latency—delivering real-time posture corrections in ~22 milliseconds.

2. **Soothing, Non-Intimidating Coaching**
   - Single-cue debounced feedback (*"Lower your right shoulder slightly"*), calm natural pacing, and zero gamified confetti noise.
   - Multilingual voice synthesis & voice pain check-in in English, Hindi (हिन्दी), and Telugu (తెలుగు).

3. **Clinical Physiotherapy Intelligence**
   - Automated Range of Motion (ROM) progression tracking with week-over-week recovery comparison.
   - Built-in clinical safety rules: Immediate session halt if pain is $\ge 7/10$ or sharp pain is reported.

4. **100% Offline & Absolute Privacy**
   - PWA architecture with full local precaching: Operates seamlessly in Airplane Mode.
   - Volatile camera processing: Frames are analyzed and immediately discarded. Only summary metrics are stored locally.

5. **Local Clinic Bridge & Zero Cloud Infra**
   - Offline peer-to-peer sync via QR codes and local network WebSockets to the clinic laptop dashboard.
   - Instant offline PDF clinical session report generation for therapists.
