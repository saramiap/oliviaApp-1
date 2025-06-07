import { useState } from "react";

export default function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (text, voiceEnabled = true) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    const cleanedText = text
      .replace(/[*_~]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/[\[\]{}()]/g, "")
      .replace(/[:;+=<>#|]/g, "")
      .replace(/\.{2,}/g, ".")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "fr-FR";

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return { speak, isSpeaking };
}
