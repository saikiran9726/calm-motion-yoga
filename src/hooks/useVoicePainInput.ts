import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export interface VoicePainResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  detectedScore: number | null;
  detectedArea: string | null;
  parsedPain: { score: number; area: string | null } | null;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

const NUMBER_MAP: Record<string, number> = {
  // English words & digits
  "0": 0, "zero": 0, "none": 0, "no pain": 0,
  "1": 1, "one": 1,
  "2": 2, "two": 2,
  "3": 3, "three": 3,
  "4": 4, "four": 4,
  "5": 5, "five": 5,
  "6": 6, "six": 6,
  "7": 7, "seven": 7,
  "8": 8, "eight": 8,
  "9": 9, "nine": 9,
  "10": 10, "ten": 10,

  // Hindi words (using unicode escapes)
  "\u0936\u0942\u0928\u094d\u092f": 0,
  "\u090f\u0915": 1,
  "\u0926\u094b": 2,
  "\u0924\u0940\u0928": 3,
  "\u091a\u093e\u0930": 4,
  "\u092a\u093e\u0901\u091a": 5,
  "\u092a\u093e\u0902\u091a": 5,
  "\u091b\u0939": 6,
  "\u0938\u093e\u0924": 7,
  "\u0906\u0920": 8,
  "\u0928\u094c": 9,
  "\u0926\u0938": 10,

  // Telugu words (using unicode escapes)
  "\u0c38\u0c41\u0c28\u0c4d\u0c28\u0c3e": 0,
  "\u0c12\u0c15\u0c1f\u0c3f": 1,
  "\u0c30\u0c46\u0c02\u0c21\u0c41": 2,
  "\u0c2e\u0c42\u0c21\u0c41": 3,
  "\u0c28\u0c3e\u0c32\u0c41\u0c17\u0c41": 4,
  "\u0c10\u0c26\u0c41": 5,
  "\u0c06\u0c30\u0c41": 6,
  "\u0c0f\u0c21\u0c41": 7,
  "\u0c0e\u0c28\u0c2e\u0c3f\u0c26\u0c3f": 8,
  "\u0c24\u0c4a\u0c2e\u0c4d\u0c2e\u0c26\u0c3f": 9,
  "\u0c2a\u0c26\u0c3f": 10,
};

const BODY_AREAS = [
  { area: "shoulder", keywords: ["shoulder", "trapezius", "\u0915\u0902\u0927\u093e", "\u0c2d\u0c41\u0c1c\u0c02"] },
  { area: "knee", keywords: ["knee", "patella", "\u0918\u0941\u091f\u0928\u093e", "\u0c2e\u0c4b\u0c15\u0c3e\u0c32\u0c41"] },
  { area: "spine", keywords: ["spine", "back", "lumbar", "\u092a\u0940\u0920", "\u0915\u092e\u0930", "\u0c35\u0c46\u0c28\u0c4d\u0c28\u0c41"] },
  { area: "neck", keywords: ["neck", "cervical", "\u0917\u0930\u094d\u0926\u0928", "\u0c2e\u0c41\u0c26\u0c41"] },
  { area: "hip", keywords: ["hip", "pelvis", "\u0915\u0942\u0932\u094d\u0939\u093e", "\u0c28\u0c21\u0c41\u0c2e\u0c41"] },
];

export function useVoicePainInput(onPainDetected?: (score: number, area?: string) => void): VoicePainResult {
  const { i18n } = useTranslation();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [detectedScore, setDetectedScore] = useState<number | null>(null);
  const [detectedArea, setDetectedArea] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select speech recognition locale based on active language
      const lang = i18n.language?.slice(0, 2);
      if (lang === "hi") {
        recognition.lang = "hi-IN";
      } else if (lang === "te") {
        recognition.lang = "te-IN";
      } else {
        recognition.lang = "en-US";
      }

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript?.trim().toLowerCase() || "";
        setTranscript(text);

        // 1. Detect 0-10 score
        let score: number | null = null;

        // Try regex digits first
        const digitMatch = text.match(/\b([0-9]|10)\b/);
        if (digitMatch) {
          score = parseInt(digitMatch[1], 10);
        } else {
          for (const [word, val] of Object.entries(NUMBER_MAP)) {
            if (text.includes(word)) {
              score = val;
              break;
            }
          }
        }

        // 2. Detect body area
        let area: string | null = null;
        for (const item of BODY_AREAS) {
          if (item.keywords.some((kw) => text.includes(kw))) {
            area = item.area;
            break;
          }
        }

        if (score !== null) {
          setDetectedScore(score);
          setDetectedArea(area);
          onPainDetected?.(score, area || undefined);
        }
      };

      recognition.onerror = (err: any) => {
        setIsListening(false);
        if (err.error === "not-allowed") {
          setError("Microphone permission denied. Use the slider below.");
        } else if (err.error !== "no-speech") {
          setError("Voice input unavailable. Use the slider below.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [i18n.language]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setDetectedScore(null);
    setDetectedArea(null);
    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      // If already started
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const parsedPain = detectedScore !== null ? { score: detectedScore, area: detectedArea } : null;

  return {
    isSupported,
    isListening,
    transcript,
    detectedScore,
    detectedArea,
    parsedPain,
    startListening,
    stopListening,
    error,
  };
}
