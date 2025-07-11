/**
 * Données des suggestions de journal
 * Olivia Sérenis - Phase 3
 */

export interface JournalPrompt {
  id: string;
  title: string;
  question: string;
  description: string;
  category: 'gratitude' | 'reflection' | 'emotions' | 'goals' | 'stress' | 'mindfulness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // temps estimé en minutes
  benefits: string[];
  followUpQuestions?: string[];
  icon: string;
}

export interface MotivationalQuote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'peace' | 'growth' | 'courage' | 'wisdom';
}

export const journalPrompts: JournalPrompt[] = [
  {
    id: 'daily_gratitude',
    title: 'Gratitude Quotidienne',
    question: 'Quelles sont les trois choses pour lesquelles vous êtes reconnaissant(e) aujourd\'hui ?',
    description: 'Cultiver un état d\'esprit positif en identifiant les bénédictions quotidiennes.',
    category: 'gratitude',
    difficulty: 'beginner',
    estimatedTime: 5,
    icon: 'heart',
    benefits: [
      'Amélioration de l\'humeur',
      'Réduction du stress',
      'Perspective positive',
      'Bien-être général'
    ],
    followUpQuestions: [
      'Pourquoi ces éléments sont-ils importants pour vous ?',
      'Comment pouvez-vous en profiter davantage ?'
    ]
  },
  {
    id: 'emotion_exploration',
    title: 'Exploration Émotionnelle',
    question: 'Quelle émotion avez-vous ressentie le plus fortement aujourd\'hui ? Décrivez-la en détail.',
    description: 'Développer l\'intelligence émotionnelle en explorant ses ressentis.',
    category: 'emotions',
    difficulty: 'intermediate',
    estimatedTime: 10,
    icon: 'color-palette',
    benefits: [
      'Conscience émotionnelle',
      'Régulation des émotions',
      'Auto-connaissance',
      'Gestion du stress'
    ],
    followUpQuestions: [
      'Qu\'est-ce qui a déclenché cette émotion ?',
      'Comment votre corps a-t-il réagi ?',
      'Que vous apprend cette émotion sur vous-même ?'
    ]
  },
  {
    id: 'stress_reflection',
    title: 'Réflexion sur le Stress',
    question: 'Quels ont été les moments les plus stressants de votre journée ? Comment avez-vous réagi ?',
    description: 'Analyser ses réactions au stress pour mieux les gérer à l\'avenir.',
    category: 'stress',
    difficulty: 'intermediate',
    estimatedTime: 8,
    icon: 'warning',
    benefits: [
      'Identification des déclencheurs',
      'Amélioration de la gestion du stress',
      'Développement de stratégies',
      'Prévention du burnout'
    ],
    followUpQuestions: [
      'Quelles stratégies ont fonctionné ?',
      'Que feriez-vous différemment la prochaine fois ?'
    ]
  },
  {
    id: 'mindful_moment',
    title: 'Moment de Pleine Conscience',
    question: 'Décrivez un moment où vous étiez pleinement présent(e) aujourd\'hui. Que ressentiez-vous ?',
    description: 'Cultiver la pleine conscience en revisitant les moments de présence.',
    category: 'mindfulness',
    difficulty: 'beginner',
    estimatedTime: 6,
    icon: 'flower',
    benefits: [
      'Développement de la pleine conscience',
      'Ancrage dans le présent',
      'Réduction de l\'anxiété',
      'Clarté mentale'
    ],
    followUpQuestions: [
      'Comment pouvez-vous créer plus de ces moments ?',
      'Qu\'avez-vous remarqué de nouveau dans cet instant ?'
    ]
  },
  {
    id: 'weekly_goals',
    title: 'Objectifs de la Semaine',
    question: 'Quels sont vos trois objectifs principaux pour cette semaine ? Pourquoi sont-ils importants ?',
    description: 'Clarifier ses intentions et créer un plan d\'action pour la semaine.',
    category: 'goals',
    difficulty: 'intermediate',
    estimatedTime: 12,
    icon: 'flag',
    benefits: [
      'Clarté des objectifs',
      'Motivation accrue',
      'Organisation personnelle',
      'Sentiment d\'accomplissement'
    ],
    followUpQuestions: [
      'Quelles actions concrètes allez-vous entreprendre ?',
      'Quels obstacles pourriez-vous rencontrer ?'
    ]
  },
  {
    id: 'personal_growth',
    title: 'Croissance Personnelle',
    question: 'Dans quel domaine de votre vie souhaitez-vous grandir ? Quelle serait la première étape ?',
    description: 'Identifier les opportunités de développement personnel et planifier l\'action.',
    category: 'reflection',
    difficulty: 'advanced',
    estimatedTime: 15,
    icon: 'trending-up',
    benefits: [
      'Auto-amélioration',
      'Développement personnel',
      'Clarté des valeurs',
      'Vision à long terme'
    ],
    followUpQuestions: [
      'Qu\'est-ce qui vous motive dans cette croissance ?',
      'Comment mesurerez-vous vos progrès ?'
    ]
  },
  {
    id: 'gratitude_people',
    title: 'Gratitude envers les Autres',
    question: 'Qui a eu un impact positif sur votre vie récemment ? Comment vous ont-ils aidé(e) ?',
    description: 'Reconnaître l\'importance des relations et exprimer sa gratitude.',
    category: 'gratitude',
    difficulty: 'beginner',
    estimatedTime: 7,
    icon: 'people',
    benefits: [
      'Renforcement des relations',
      'Sentiment de connexion',
      'Appréciation d\'autrui',
      'Bien-être social'
    ],
    followUpQuestions: [
      'Comment pouvez-vous leur exprimer votre gratitude ?',
      'Que pouvez-vous faire pour les soutenir en retour ?'
    ]
  },
  {
    id: 'evening_reflection',
    title: 'Réflexion du Soir',
    question: 'Qu\'avez-vous appris sur vous-même aujourd\'hui ? Qu\'est-ce qui vous rend fier(e) ?',
    description: 'Clôturer la journée avec une réflexion positive et constructive.',
    category: 'reflection',
    difficulty: 'beginner',
    estimatedTime: 8,
    icon: 'moon',
    benefits: [
      'Bilan positif de la journée',
      'Reconnaissance des succès',
      'Apprentissage continu',
      'Estime de soi'
    ],
    followUpQuestions: [
      'Comment allez-vous appliquer cet apprentissage demain ?',
      'Que célébrez-vous aujourd\'hui ?'
    ]
  }
];

export const motivationalQuotes: MotivationalQuote[] = [
  {
    id: 'growth_mindset',
    text: 'La seule façon de donner un sens à votre vie est de grandir, d\'évoluer et de contribuer.',
    author: 'Anthony Robbins',
    category: 'growth'
  },
  {
    id: 'present_moment',
    text: 'La paix vient de l\'intérieur. Ne la cherchez pas à l\'extérieur.',
    author: 'Bouddha',
    category: 'peace'
  },
  {
    id: 'courage_action',
    text: 'Le courage n\'est pas l\'absence de peur, mais l\'action malgré la peur.',
    author: 'Nelson Mandela',
    category: 'courage'
  },
  {
    id: 'wisdom_journey',
    text: 'Ce n\'est pas la destination, mais le voyage qui compte.',
    author: 'Ralph Waldo Emerson',
    category: 'wisdom'
  },
  {
    id: 'motivation_start',
    text: 'La meilleure façon de commencer quelque chose est d\'arrêter de parler et de commencer à faire.',
    author: 'Walt Disney',
    category: 'motivation'
  }
];

/**
 * Obtient un prompt par son ID
 */
export function getPromptById(promptId: string): JournalPrompt | undefined {
  return journalPrompts.find(prompt => prompt.id === promptId);
}

/**
 * Obtient les prompts par catégorie
 */
export function getPromptsByCategory(category: JournalPrompt['category']): JournalPrompt[] {
  return journalPrompts.filter(prompt => prompt.category === category);
}

/**
 * Obtient les prompts recommandés (pour débutants)
 */
export function getRecommendedPrompts(): JournalPrompt[] {
  return journalPrompts.filter(prompt => prompt.difficulty === 'beginner').slice(0, 3);
}

/**
 * Obtient une citation aléatoire
 */
export function getRandomQuote(): MotivationalQuote {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
}

/**
 * Obtient une citation par catégorie
 */
export function getQuoteByCategory(category: MotivationalQuote['category']): MotivationalQuote | undefined {
  const categoryQuotes = motivationalQuotes.filter(quote => quote.category === category);
  if (categoryQuotes.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex];
}

/**
 * Obtient l'icône pour une catégorie de prompt
 */
export function getCategoryIcon(category: JournalPrompt['category']): string {
  switch (category) {
    case 'gratitude':
      return 'heart';
    case 'reflection':
      return 'bulb';
    case 'emotions':
      return 'color-palette';
    case 'goals':
      return 'flag';
    case 'stress':
      return 'warning';
    case 'mindfulness':
      return 'flower';
    default:
      return 'book';
  }
}

/**
 * Obtient la couleur pour une catégorie de prompt
 */
export function getCategoryColor(category: JournalPrompt['category']): string {
  switch (category) {
    case 'gratitude':
      return '#22C55E'; // nature.500
    case 'reflection':
      return '#0EA5E9'; // primary.500
    case 'emotions':
      return '#A855F7'; // spiritual.500
    case 'goals':
      return '#F59E0B'; // warm.500
    case 'stress':
      return '#EF4444'; // error
    case 'mindfulness':
      return '#22C55E'; // nature.500
    default:
      return '#6B7280'; // text.secondary
  }
}

/**
 * Formate le temps estimé
 */
export function formatEstimatedTime(minutes: number): string {
  if (minutes < 5) {
    return 'Rapide';
  } else if (minutes <= 10) {
    return `${minutes} min`;
  } else {
    return `${minutes} min`;
  }
}