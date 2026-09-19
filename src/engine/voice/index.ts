// Multilingual Speech Synthesis Coach for Calm Motion (English, Hindi, Telugu)

export type VoiceLanguage = 'en' | 'hi' | 'te';

interface TranslationMap {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
  };
}

const PHRASES: TranslationMap = {
  start: {
    en: 'Starting live motion session. Stand in full view and move at a calm pace.',
    hi: 'सत्र शुरू हो रहा है। शांत गति से आगे बढ़ें।',
    te: 'సెషన్ ప్రారంభమవుతుంది. ప్రశాంతంగా కదలండి.',
  },
  good_movement: {
    en: 'Good movement. Keep breathing steadily.',
    hi: 'अच्छा संतुलन। सहज रूप से सांस लें।',
    te: 'మంచి కదలిక. శ్వాసను స్థిరంగా ఉంచండి.',
  },
  lower_shoulder: {
    en: 'Lower your right shoulder slightly.',
    hi: 'अपने दाहिने कंधे को थोड़ा नीचे करें।',
    te: 'మీ కుడి భుజాన్ని కొద్దిగా దించండి.',
  },
  spine_align: {
    en: 'Lengthen your spine and relax your neck.',
    hi: 'अपनी रीढ़ सीधी रखें और गर्दन शिथिल करें।',
    te: 'వెన్నుముకను నిటారుగా ఉంచి మెడను రిలాక్స్ చేయండి.',
  },
  rep_milestone: {
    en: 'Halfway completed. Steady focus.',
    hi: 'आधा अभ्यास पूर्ण। एकाग्र रहें।',
    te: 'సగం పూర్తయింది. స్థిరంగా కొనసాగించండి.',
  },
  pain_checkin: {
    en: 'How does your body feel? Rate your comfort on a scale from 0 to 10.',
    hi: 'आप कैसा महसूस कर रहे हैं? शून्य से दस तक दर्द बताएं।',
    te: 'మీకు ఎలా అనిపిస్తుంది? సున్నా నుండి పది వరకు నొప్పిని తెలపండి.',
  },
  pain_stop: {
    en: 'Stopping exercise for your safety and comfort. Rest in a neutral position.',
    hi: 'आपकी सुरक्षा के लिए व्यायाम रोका गया है। आराम से बैठें।',
    te: 'మీ భద్రత కొరకు వ్యాయామం ఆపబడింది. విశ్రాంతి తీసుకోండి.',
  },
  completed: {
    en: 'Exercise completed. Wonderful dedication today.',
    hi: 'अभ्यास पूर्ण हुआ। आज आपका प्रयास बहुत सुंदर रहा।',
    te: 'వ్యాయామం పూర్తయింది. ఈరోజు అద్భుతమైన సాధన.',
  },
};

export class VoiceCoach {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private isMuted: boolean = false;
  private currentLanguage: VoiceLanguage = 'en';

  setLanguage(lang: VoiceLanguage) {
    this.currentLanguage = lang;
  }

  getLanguage(): VoiceLanguage {
    return this.currentLanguage;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
    }
  }

  isVoiceMuted(): boolean {
    return this.isMuted;
  }

  speakKey(key: keyof typeof PHRASES, overrideLang?: VoiceLanguage) {
    const lang = overrideLang || this.currentLanguage;
    const phraseGroup = PHRASES[key];
    if (!phraseGroup) return;
    const text = phraseGroup[lang] || phraseGroup.en;
    this.speak(text, lang);
  }

  speak(text: string, lang: VoiceLanguage = this.currentLanguage) {
    if (this.isMuted || !this.synth) return;

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.90; // Calm, clinical, deliberate pacing
      utterance.pitch = 1.0;

      // Assign localized BCP-47 tag
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else if (lang === 'te') {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-US';
      }

      // Find best available voice on this device
      const voices = this.synth.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().slice(0, 2)));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceCoach = new VoiceCoach();
