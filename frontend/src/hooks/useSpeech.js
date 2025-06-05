import { useState, useRef, useEffect } from "react";

export default function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  
  // Fonction pour arrêter la parole (nouvelle fonction)
  const cancelSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Nettoyer lorsque le composant est démonté
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text, voiceEnabled = true) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Annuler toute parole en cours avant d'en commencer une nouvelle
    cancelSpeech();

    const cleanedText = text
      .replace(/[*_~]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/[\[\]{}()]/g, "")
      .replace(/[:;+=<>#|]/g, "")
      .replace(/\.{2,}/g, ".")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "fr-FR";
    utteranceRef.current = utterance;

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return { speak, isSpeaking, cancelSpeech };
}
