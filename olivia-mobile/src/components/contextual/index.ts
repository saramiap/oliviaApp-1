/**
 * Index des composants contextuels
 * Olivia Sérenis - Phase 3
 */

export { default as SoundJourneyPreview } from './SoundJourneyPreview';
export { default as ThemeCarouselCard } from './ThemeCarouselCard';
export { default as BreathingPreview } from './BreathingPreview';
export { default as JournalPreview } from './JournalPreview';

// Types réexportés pour faciliter l'utilisation
export type { SoundJourneyTheme, AudioTrack } from '../../data/soundJourneyThemes';
export type { BreathingExercise, BreathingPattern } from '../../data/breathingExercises';
export type { JournalPrompt, MotivationalQuote } from '../../data/journalPrompts';