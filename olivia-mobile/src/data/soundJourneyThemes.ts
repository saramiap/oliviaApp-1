/**
 * Données des thèmes de voyages sonores
 * Olivia Sérenis - Phase 2
 */

export interface AudioTrack {
  id: string;
  title: string;
  duration: number; // en secondes
  audioPath: string;
  previewPath?: string; // pour l'aperçu de 30s
  src?: any; // pour React Native Audio.Sound
  loop?: boolean;
  volume?: number;
  delay?: number;
}

export interface SoundJourneyTheme {
  id: string;
  title: string;
  description: string;
  backgroundImage: any; // Pour React Native require()
  category: 'nature' | 'relaxation' | 'meditation' | 'ambient';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audioTracks: AudioTrack[];
  duration: number; // durée totale en secondes
  benefits: string[];
  tags: string[];
  oliviaIntro?: string;
  oliviaOutro?: string;
}

export const soundJourneyThemes: SoundJourneyTheme[] = [
  {
    id: 'forest',
    title: 'Forêt Apaisante',
    description: 'Plongez dans l\'atmosphère sereine d\'une forêt luxuriante. Les bruits doux des feuilles et des oiseaux vous transporteront vers un état de calme profond.',
    backgroundImage: require('../../assets/images/foret.jpg'),
    category: 'nature',
    difficulty: 'beginner',
    duration: 1200, // 20 minutes
    benefits: [
      'Réduction du stress',
      'Amélioration de la concentration',
      'Connexion avec la nature'
    ],
    tags: ['nature', 'oiseaux', 'feuillage', 'tranquillité'],
    audioTracks: [
      {
        id: 'forest_main',
        title: 'Méditation Automne',
        duration: 1200,
        audioPath: '../assets/audio/autumn-sky-meditation-7618.mp3',
        previewPath: '../assets/audio/autumn-sky-meditation-7618.mp3',
        src: require('../../assets/audio/autumn-sky-meditation-7618.mp3'),
        loop: true,
        volume: 1
      }
    ],
    oliviaIntro: "Bienvenue dans cette forêt apaisante. Ferme les yeux et laisse-toi transporter par les doux bruissements des feuilles et les chants d'oiseaux. Ce voyage va t'aider à retrouver ton calme intérieur.",
    oliviaOutro: "J'espère que cette immersion dans la forêt t'a apporté la sérénité que tu cherchais. Comment te sens-tu maintenant ?"
  },
  {
    id: 'ocean',
    title: 'Vagues Océaniques',
    description: 'Laissez-vous bercer par le rythme hypnotique des vagues. Un voyage sonore qui évoque la vastitude et la paix de l\'océan.',
    backgroundImage: require('../../assets/images/la-mer.jpg'),
    category: 'nature',
    difficulty: 'beginner',
    duration: 1020, // 17 minutes
    benefits: [
      'Relaxation profonde',
      'Amélioration du sommeil',
      'Apaisement mental'
    ],
    tags: ['océan', 'vagues', 'plage', 'sérénité'],
    audioTracks: [
      {
        id: 'ocean_waves',
        title: 'Vagues de Plage',
        duration: 1020,
        audioPath: '../assets/audio/ocean-beach-waves-332383.mp3',
        previewPath: '../assets/audio/ocean-beach-waves-332383.mp3',
        src: require('../../assets/audio/ocean-beach-waves-332383.mp3'),
        loop: true,
        volume: 1
      }
    ],
    oliviaIntro: "Installe-toi confortablement et laisse les vagues de l'océan bercer tes pensées. Ce rythme naturel va t'aider à relâcher toutes les tensions de la journée.",
    oliviaOutro: "Les vagues de l'océan t'ont-elles aidé à te détendre ? Prends un moment pour ressentir cette paix intérieure."
  },
  {
    id: 'rain',
    title: 'Pluie Relaxante',
    description: 'Une pluie douce qui tombe sur les toits et la végétation. Un son apaisant qui favorise la détente et la méditation.',
    backgroundImage: require('../../assets/images/pluie-relaxante.jpg'),
    category: 'nature',
    difficulty: 'beginner',
    duration: 900, // 15 minutes
    benefits: [
      'Relaxation instantanée',
      'Aide à l\'endormissement',
      'Masquage des bruits extérieurs'
    ],
    tags: ['pluie', 'gouttes', 'nature', 'paisible'],
    audioTracks: [
      {
        id: 'gentle_rain',
        title: 'Pluie Douce',
        duration: 900,
        audioPath: '../assets/audio/gentle-rain-for-relaxation-and-sleep-337279.mp3',
        previewPath: '../assets/audio/gentle-rain-for-relaxation-and-sleep-337279.mp3',
        src: require('../../assets/audio/gentle-rain-for-relaxation-and-sleep-337279.mp3'),
        loop: true,
        volume: 1
      }
    ],
    oliviaIntro: "Écoute cette pluie douce qui tombe. Chaque goutte emporte avec elle un peu de stress. Respire profondément et laisse cette mélodie naturelle t'apaiser.",
    oliviaOutro: "Cette pluie relaxante t'a-t-elle permis de te recentrer ? Observe comme ton esprit est maintenant plus paisible."
  },
  {
    id: 'fireplace',
    title: 'Feu de Cheminée',
    description: 'La chaleur et le crépitement réconfortant d\'un feu de cheminée. Parfait pour créer une atmosphère cocooning et chaleureuse.',
    backgroundImage: require('../../assets/images/relaxation.jpg'),
    category: 'ambient',
    difficulty: 'beginner',
    duration: 1800, // 30 minutes
    benefits: [
      'Sensation de chaleur',
      'Ambiance cocooning',
      'Réduction de l\'anxiété'
    ],
    tags: ['feu', 'cheminée', 'chaleur', 'confort'],
    audioTracks: [
      {
        id: 'fireplace_crackle',
        title: 'Crépitement de Cheminée',
        duration: 1800,
        audioPath: '../assets/audio/feu-de-chemine.mp3',
        previewPath: '../assets/audio/feu-de-chemine.mp3',
        src: require('../../assets/audio/feu-de-chemine.mp3'),
        loop: true,
        volume: 1
      }
    ]
  },
  {
    id: 'water_zen',
    title: 'Eau Zen',
    description: 'L\'écoulement paisible de l\'eau dans un environnement zen. Sons apaisants qui favorisent la méditation et l\'introspection.',
    backgroundImage: require('../../assets/images/patoger-dans-leau.jpg'),
    category: 'meditation',
    difficulty: 'intermediate',
    duration: 1440, // 24 minutes
    benefits: [
      'Méditation profonde',
      'Clarté mentale',
      'Équilibre émotionnel'
    ],
    tags: ['eau', 'zen', 'méditation', 'flow'],
    audioTracks: [
      {
        id: 'zen_water',
        title: 'Ambience Zen Eau',
        duration: 1440,
        audioPath: '../assets/audio/nature-ambience-zen-eau-relaxe1.mp3',
        previewPath: '../assets/audio/nature-ambience-zen-eau-relaxe1.mp3',
        src: require('../../assets/audio/nature-ambience-zen-eau-relaxe1.mp3'),
        loop: true,
        volume: 1
      }
    ]
  },
  {
    id: 'meditation',
    title: 'Méditation Guidée',
    description: 'Une expérience de méditation complète avec musique de fond relaxante. Idéal pour débuter ou approfondir votre pratique.',
    backgroundImage: require('../../assets/images/yoga.jpg'),
    category: 'meditation',
    difficulty: 'intermediate',
    duration: 1200, // 20 minutes
    benefits: [
      'Initiation à la méditation',
      'Paix intérieure',
      'Développement personnel'
    ],
    tags: ['méditation', 'guidance', 'spiritualité', 'paix'],
    audioTracks: [
      {
        id: 'relaxation_music',
        title: 'Musique de Relaxation',
        duration: 1200,
        audioPath: '../assets/audio/relaxation-music-fond.mp3',
        previewPath: '../assets/audio/relaxation-music-fond.mp3',
        src: require('../../assets/audio/relaxation-music-fond.mp3'),
        loop: true,
        volume: 1
      }
    ]
  }
];

/**
 * Obtient un thème par son ID
 */
export function getThemeById(themeId: string): SoundJourneyTheme | undefined {
  return soundJourneyThemes.find(theme => theme.id === themeId);
}

/**
 * Obtient les thèmes par catégorie
 */
export function getThemesByCategory(category: SoundJourneyTheme['category']): SoundJourneyTheme[] {
  return soundJourneyThemes.filter(theme => theme.category === category);
}

/**
 * Obtient les thèmes recommandés (les 3 premiers)
 */
export function getRecommendedThemes(): SoundJourneyTheme[] {
  return soundJourneyThemes.slice(0, 3);
}

/**
 * Formate la durée en minutes
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

/**
 * Obtient l'icône pour une catégorie
 */
export function getCategoryIcon(category: SoundJourneyTheme['category']): string {
  switch (category) {
    case 'nature':
      return 'leaf';
    case 'relaxation':
      return 'heart';
    case 'meditation':
      return 'flower';
    case 'ambient':
      return 'home';
    default:
      return 'musical-notes';
  }
}