export interface ChatMessage {
  from: 'user' | 'model';
  text: string;
  displayText?: string;
  actionName?: string | null;
  actionParams?: Record<string, any>;
  id?: string;
  timestamp?: number;
}

export interface ActionTagParsed {
  actionName: string | null;
  params: Record<string, any>;
  displayText: string;
  rawText: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export type ActionType =
  | 'EXERCICE_RESPIRATION'
  | 'VOYAGE_SONORE'
  | 'SUGGESTION_JOURNAL'
  | 'INFO_STRESS'
  | 'REDIRECT'
  | 'NAVIGATE_FULL_SOUND_JOURNEY'
  | 'QUICK_PLAY_SOUND_JOURNEY'
  | 'PREVIEW_BREATHING_PATTERN'
  | 'START_BREATHING_EXERCISE'
  | 'OPEN_JOURNAL_WITH_PROMPT'
  | 'VIEW_JOURNAL_ENTRIES';

export interface ActionParams {
  type?: string;
  duration?: number;
  duree_sec?: number;
  cycles?: number;
  themeId?: string;
  prompt?: string;
  sujet?: string;
  path?: string;
  // Nouveaux paramètres pour les exercices de respiration
  exerciseId?: string;
  pattern?: any;
  title?: string;
  // Nouveaux paramètres pour le journal
  promptId?: string;
  question?: string;
  estimatedTime?: number;
  lastEntry?: string;
  category?: string;
}

// Types pour les contextes d'interface
export type ContextType = 'simple' | 'preview' | 'immersive';

// Interface pour les actions contextuelles
export interface ContextualAction {
  type: ActionType;
  contextType: ContextType;
  params: ActionParams;
  metadata?: {
    title?: string;
    description?: string;
    previewData?: any;
    requiresConfirmation?: boolean;
  };
}

// Interface étendue pour les messages avec contexte
export interface ContextualChatMessage extends ChatMessage {
  contextualAction?: ContextualAction;
}