/**
 * Données des exercices de respiration
 * Olivia Sérenis - Phase 3
 */

export interface BreathingPattern {
  inhale: number;    // durée inspiration en secondes
  hold1?: number;    // durée rétention après inspiration
  exhale: number;    // durée expiration en secondes
  hold2?: number;    // durée rétention après expiration
}

export interface BreathingExercise {
  id: string;
  title: string;
  description: string;
  pattern: BreathingPattern;
  defaultDuration: number;    // durée par défaut en secondes
  defaultCycles: number;      // nombre de cycles par défaut
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  instructions: string;
  category: 'relaxation' | 'energy' | 'focus' | 'sleep';
  icon: string;
}

export const breathingExercises: BreathingExercise[] = [
  {
    id: 'box_breathing',
    title: 'Respiration Carrée',
    description: 'Technique de respiration 4-4-4-4 pour la relaxation et la concentration.',
    pattern: {
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4
    },
    defaultDuration: 300, // 5 minutes
    defaultCycles: 10,
    difficulty: 'beginner',
    category: 'relaxation',
    icon: 'square',
    benefits: [
      'Réduction du stress',
      'Amélioration de la concentration',
      'Équilibre du système nerveux',
      'Calme mental instantané'
    ],
    instructions: 'Inspirez pendant 4 secondes, retenez 4 secondes, expirez 4 secondes, retenez 4 secondes. Répétez.'
  },
  {
    id: 'four_seven_eight',
    title: 'Technique 4-7-8',
    description: 'Respiration 4-7-8 pour l\'endormissement et la relaxation profonde.',
    pattern: {
      inhale: 4,
      hold1: 7,
      exhale: 8
    },
    defaultDuration: 240, // 4 minutes
    defaultCycles: 8,
    difficulty: 'intermediate',
    category: 'sleep',
    icon: 'moon',
    benefits: [
      'Aide à l\'endormissement',
      'Relaxation profonde',
      'Réduction de l\'anxiété',
      'Activation du système parasympathique'
    ],
    instructions: 'Inspirez par le nez pendant 4 secondes, retenez 7 secondes, expirez par la bouche pendant 8 secondes.'
  },
  {
    id: 'coherence_cardiaque',
    title: 'Cohérence Cardiaque',
    description: 'Respiration 5-5 pour synchroniser le cœur et réduire le stress.',
    pattern: {
      inhale: 5,
      exhale: 5
    },
    defaultDuration: 300, // 5 minutes
    defaultCycles: 30,
    difficulty: 'beginner',
    category: 'relaxation',
    icon: 'heart',
    benefits: [
      'Réduction du stress',
      'Équilibre émotionnel',
      'Amélioration de la variabilité cardiaque',
      'Bien-être général'
    ],
    instructions: 'Inspirez pendant 5 secondes, expirez pendant 5 secondes. Gardez un rythme régulier.'
  },
  {
    id: 'energizing_breath',
    title: 'Respiration Énergisante',
    description: 'Technique de respiration pour augmenter l\'énergie et la vitalité.',
    pattern: {
      inhale: 2,
      exhale: 2
    },
    defaultDuration: 180, // 3 minutes
    defaultCycles: 45,
    difficulty: 'intermediate',
    category: 'energy',
    icon: 'flash',
    benefits: [
      'Augmentation de l\'énergie',
      'Amélioration de la vigilance',
      'Stimulation du métabolisme',
      'Réveil en douceur'
    ],
    instructions: 'Respirations courtes et rythmées. Inspirez 2 secondes, expirez 2 secondes, de manière dynamique.'
  },
  {
    id: 'deep_relaxation',
    title: 'Respiration Profonde',
    description: 'Respiration lente et profonde pour une relaxation maximale.',
    pattern: {
      inhale: 6,
      hold1: 2,
      exhale: 8,
      hold2: 2
    },
    defaultDuration: 480, // 8 minutes
    defaultCycles: 15,
    difficulty: 'advanced',
    category: 'relaxation',
    icon: 'leaf',
    benefits: [
      'Relaxation profonde',
      'Réduction de la tension musculaire',
      'Calme mental durable',
      'Récupération physique'
    ],
    instructions: 'Respirations lentes et profondes. Concentrez-vous sur le mouvement du diaphragme.'
  },
  {
    id: 'focus_breath',
    title: 'Respiration de Concentration',
    description: 'Technique pour améliorer la concentration et la clarté mentale.',
    pattern: {
      inhale: 3,
      hold1: 3,
      exhale: 3
    },
    defaultDuration: 360, // 6 minutes
    defaultCycles: 40,
    difficulty: 'intermediate',
    category: 'focus',
    icon: 'eye',
    benefits: [
      'Amélioration de la concentration',
      'Clarté mentale',
      'Réduction des distractions',
      'Performance cognitive'
    ],
    instructions: 'Respirez avec régularité en vous concentrant uniquement sur votre souffle.'
  }
];

/**
 * Obtient un exercice par son ID
 */
export function getExerciseById(exerciseId: string): BreathingExercise | undefined {
  return breathingExercises.find(exercise => exercise.id === exerciseId);
}

/**
 * Obtient les exercices par catégorie
 */
export function getExercisesByCategory(category: BreathingExercise['category']): BreathingExercise[] {
  return breathingExercises.filter(exercise => exercise.category === category);
}

/**
 * Obtient les exercices recommandés (3 premiers pour débutants)
 */
export function getRecommendedExercises(): BreathingExercise[] {
  return breathingExercises.filter(ex => ex.difficulty === 'beginner').slice(0, 3);
}

/**
 * Calcule la durée totale d'un cycle de respiration
 */
export function calculateCycleDuration(pattern: BreathingPattern): number {
  return (pattern.inhale || 0) + 
         (pattern.hold1 || 0) + 
         (pattern.exhale || 0) + 
         (pattern.hold2 || 0);
}

/**
 * Formate la durée en minutes et secondes
 */
export function formatBreathingDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes} min`;
  } else {
    return `${minutes} min ${remainingSeconds}s`;
  }
}

/**
 * Obtient l'icône pour une catégorie d'exercice
 */
export function getCategoryIcon(category: BreathingExercise['category']): string {
  switch (category) {
    case 'relaxation':
      return 'leaf';
    case 'energy':
      return 'flash';
    case 'focus':
      return 'eye';
    case 'sleep':
      return 'moon';
    default:
      return 'respiratory';
  }
}

/**
 * Obtient la couleur pour une catégorie d'exercice
 */
export function getCategoryColor(category: BreathingExercise['category']): string {
  switch (category) {
    case 'relaxation':
      return '#22C55E'; // nature.500
    case 'energy':
      return '#F59E0B'; // warm.500
    case 'focus':
      return '#0EA5E9'; // primary.500
    case 'sleep':
      return '#A855F7'; // spiritual.500
    default:
      return '#6B7280'; // text.secondary
  }
}