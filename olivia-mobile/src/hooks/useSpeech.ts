import { useState } from 'react';
import * as Speech from 'expo-speech';

interface UseSpeechReturn {
  speak: (text: string, voiceEnabled?: boolean) => Promise<void>;
  isSpeaking: boolean;
  cancelSpeech: () => void;
}

export default function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = async (text: string, voiceEnabled: boolean = true): Promise<void> => {
    if (!voiceEnabled || !text) return;

    // Nettoyage du texte (même logique que le frontend web)
    const cleanedText = text
      .replace(/[*_~]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/[\[\]{}()]/g, "")
      .replace(/[:;+=<>#|]/g, "")
      .replace(/\.{2,}/g, ".")
      .trim();

    if (!cleanedText) return;

    try {
      setIsSpeaking(true);

      await Speech.speak(cleanedText, {
        language: 'fr-FR',
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Erreur lors de la synthèse vocale:', error);
      setIsSpeaking(false);
    }
  };

  const cancelSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  return { speak, isSpeaking, cancelSpeech };
}