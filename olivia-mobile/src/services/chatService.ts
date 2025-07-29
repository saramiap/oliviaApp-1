import {
  ChatMessage,
  ActionTagParsed,
  ContextualAction,
  ContextType,
  ActionType,
  ActionParams
} from '@/types/chat';

const API_BASE_URL = 'http://localhost:3000'; // À configurer via .env en production

// Configuration du système de retry
interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

const RETRY_CONFIG: RetryConfig = {
  maxAttempts: 2, // Maintenu à 2 pour équilibrer avec les 3 tentatives serveur (total: 5)
  baseDelayMs: 1200, // 1.2 seconde - délai optimisé pour coordination avec serveur
  backoffMultiplier: 1.8, // Backoff modéré: 1.2s, 2.16s - plus rapproché pour fluidité
  retryableStatuses: [502, 500, 408] // Exclusion du 503 (géré par le serveur), garde bad gateway, server error, timeout
};

export class ChatService {
  private static instance: ChatService;

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Parse les tags d'action des messages de l'IA
   * Réutilise la logique exacte du frontend web
   */
  parseActionTag(textWithTag: string | null | undefined): ActionTagParsed {
    // DEBUG: Log de l'entrée
    console.log('[DEBUG] parseActionTag - Input:', {
      text: textWithTag,
      type: typeof textWithTag,
      length: textWithTag?.length,
      isNull: textWithTag === null,
      isUndefined: textWithTag === undefined,
      isEmpty: !textWithTag || textWithTag.trim() === ''
    });

    if (!textWithTag || typeof textWithTag !== 'string') {
      const safeText = String(textWithTag || '');
      console.warn('[DEBUG] parseActionTag - Texte invalide, retour de safeText:', safeText);
      return { displayText: safeText, rawText: safeText, actionName: null, params: {} };
    }
    
    const tagRegex = /#([A-Z_]+)\{((?:[^}{]+|\{[^}{]*\})*)\}/;
    const match = textWithTag.match(tagRegex);

    if (match) {
      const actionName = match[1];
      const paramsString = match[2];
      let params: Record<string, any> = {};
      
      try {
        const paramRegex = /(\w+)\s*:\s*(?:"([^"\\]*(?:\\.[^"\\]*)*)"|(\d+\.?\d*|true|false))/g;
        let paramMatch;
        
        while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
          const key = paramMatch[1];
          let value: any = paramMatch[2] !== undefined ? paramMatch[2].replace(/\\"/g, '"') : paramMatch[3];

          if (value === 'true') { value = true; }
          else if (value === 'false') { value = false; }
          else if (typeof value === 'string' && !isNaN(parseFloat(value)) && parseFloat(value).toString() === value.replace(/^"|"$/g, '')) {
               value = parseFloat(value.replace(/^"|"$/g, ''));
          }
          params[key] = value;
        }
      } catch (e) {
        console.error("Erreur parsing des paramètres du tag:", paramsString, e);
      }
      
      const displayText = textWithTag.replace(tagRegex, "").trim();
      
      // DEBUG: Log du parsing avec action
      console.log('[DEBUG] parseActionTag - Avec action:', {
        original: textWithTag,
        actionName,
        displayText,
        displayTextLength: displayText.length,
        displayTextEmpty: !displayText || displayText.trim() === '',
        params
      });

      return {
        actionName,
        params,
        displayText,
        rawText: textWithTag
      };
    }
    
    // DEBUG: Log du parsing sans action
    console.log('[DEBUG] parseActionTag - Sans action:', {
      original: textWithTag,
      displayText: textWithTag,
      length: textWithTag.length
    });
    
    return { displayText: textWithTag, rawText: textWithTag, actionName: null, params: {} };
  }

  /**
   * Parse et analyse une action pour déterminer son type contextuel
   */
  parseContextualAction(actionName: string | null, params: Record<string, any>): ContextualAction | null {
    if (!actionName) return null;

    const actionType = actionName as ActionType;
    const contextType = this.determineContextType(actionType, params);
    
    return {
      type: actionType,
      contextType,
      params: params as ActionParams,
      metadata: this.generateActionMetadata(actionType, params, contextType)
    };
  }

  /**
   * Détermine le type de contexte approprié pour une action
   */
  private determineContextType(actionType: ActionType, params: ActionParams): ContextType {
    switch (actionType) {
      case 'NAVIGATE_FULL_SOUND_JOURNEY':
        return 'immersive';
      
      case 'QUICK_PLAY_SOUND_JOURNEY':
        return 'preview';
      
      case 'VOYAGE_SONORE':
        // Si on a un themeId spécifique, on peut montrer un preview
        return params.themeId ? 'preview' : 'simple';
      
      case 'EXERCICE_RESPIRATION':
        // Si on a des paramètres détaillés, on peut montrer un preview
        return (params.type && params.duree_sec) ? 'preview' : 'simple';
      
      case 'SUGGESTION_JOURNAL':
        // Si on a un prompt spécifique, on peut montrer un preview
        return params.prompt ? 'preview' : 'simple';
      
      case 'INFO_STRESS':
      case 'REDIRECT':
      default:
        return 'simple';
    }
  }

  /**
   * Génère les métadonnées pour une action contextuelle
   */
  private generateActionMetadata(actionType: ActionType, params: ActionParams, contextType: ContextType) {
    const metadata: ContextualAction['metadata'] = {};

    switch (actionType) {
      case 'VOYAGE_SONORE':
      case 'NAVIGATE_FULL_SOUND_JOURNEY':
      case 'QUICK_PLAY_SOUND_JOURNEY':
        metadata.title = 'Voyage sonore';
        metadata.description = this.getSoundJourneyDescription(params.themeId);
        if (contextType === 'preview') {
          metadata.previewData = {
            themeId: params.themeId,
            duration: params.duration || 300 // 5 minutes par défaut
          };
        }
        break;

      case 'EXERCICE_RESPIRATION':
        metadata.title = 'Exercice de respiration';
        metadata.description = this.getBreathingDescription(params.type, params.duree_sec);
        if (contextType === 'preview') {
          metadata.previewData = {
            type: params.type,
            duration: params.duree_sec,
            cycles: params.cycles
          };
        }
        break;

      case 'SUGGESTION_JOURNAL':
        metadata.title = 'Suggestion d\'écriture';
        metadata.description = 'Explorez vos pensées à travers l\'écriture';
        if (contextType === 'preview' && params.prompt) {
          metadata.previewData = {
            prompt: params.prompt
          };
        }
        break;

      case 'INFO_STRESS':
        metadata.title = 'Comprendre le stress';
        metadata.description = 'En savoir plus sur la gestion du stress';
        break;

      case 'REDIRECT':
        metadata.title = 'Ressources d\'aide';
        metadata.description = 'Accéder aux ressources d\'urgence';
        metadata.requiresConfirmation = params.path === '/urgence';
        break;
    }

    return metadata;
  }

  /**
   * Obtient une description pour un voyage sonore
   */
  private getSoundJourneyDescription(themeId?: string): string {
    const descriptions: Record<string, string> = {
      'forest': 'Immergez-vous dans la sérénité de la forêt',
      'ocean': 'Laissez-vous bercer par les vagues apaisantes',
      'rain': 'Détendez-vous au son de la pluie douce',
      'fire': 'Trouvez la paix près du feu de cheminée',
      'mountain': 'Respirez l\'air pur des montagnes'
    };
    
    return themeId && descriptions[themeId]
      ? descriptions[themeId]
      : 'Un moment de détente sonore personnalisé';
  }

  /**
   * Obtient une description pour un exercice de respiration
   */
  private getBreathingDescription(type?: string, duration?: number): string {
    const typeDescriptions: Record<string, string> = {
      'coherence': 'Cohérence cardiaque pour retrouver l\'équilibre',
      'box': 'Respiration en carré pour la concentration',
      '478': 'Technique 4-7-8 pour l\'apaisement',
      'deep': 'Respiration profonde pour la relaxation'
    };

    const baseDescription = type && typeDescriptions[type]
      ? typeDescriptions[type]
      : 'Un exercice de respiration guidé';

    return duration
      ? `${baseDescription} (${Math.round(duration / 60)} min)`
      : baseDescription;
  }

  /**
   * Détermine si une erreur est récupérable avec retry
   */
  private isRetryableError(error: any): boolean {
    // Erreurs de réseau (fetch échoue complètement)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    
    // Erreurs HTTP récupérables (503, 502, 500, 408)
    if (error.status && RETRY_CONFIG.retryableStatuses.includes(error.status)) {
      return true;
    }
    
    // Ne pas retry les erreurs d'authentification (401, 403)
    if (error.status && [401, 403].includes(error.status)) {
      return false;
    }
    
    // Ne pas retry les erreurs client (4xx sauf 408)
    if (error.status && error.status >= 400 && error.status < 500 && error.status !== 408) {
      return false;
    }
    
    return false;
  }

  /**
   * Détermine si une réponse est vide et nécessite un retry
   */
  private isEmptyResponse(response: string): boolean {
    return !response ||
           response.trim() === '' ||
           response === 'null' ||
           response === 'undefined';
  }

  /**
   * Délai avec backoff exponentiel
   */
  private async delay(attempt: number): Promise<void> {
    const delayMs = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
    console.log(`[ChatService] Attente de ${delayMs}ms avant la tentative ${attempt + 1}`);
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Exécute une requête API avec retry
   */
  private async executeRequestWithRetry(messages: ChatMessage[]): Promise<string> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
      try {
        console.log(`[ChatService] Tentative ${attempt}/${RETRY_CONFIG.maxAttempts}`);
        
        const response = await fetch(`${API_BASE_URL}/ask-mobile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.map(msg => ({
              from: msg.from,
              text: msg.text
            }))
          })
        });

        // Vérifier le statut de la réponse
        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          (error as any).status = response.status;
          
          // Log de l'erreur avec détails
          console.error(`[ChatService] Erreur HTTP ${response.status} - Tentative ${attempt}/${RETRY_CONFIG.maxAttempts}`);
          
          if (this.isRetryableError(error) && attempt < RETRY_CONFIG.maxAttempts) {
            lastError = error;
            await this.delay(attempt);
            continue;
          }
          
          throw error;
        }

        const data = await response.json();
        const responseText = data.response || "Pardon, je n'ai pas saisi.";
        
        // Vérifier si la réponse est vide
        if (this.isEmptyResponse(responseText)) {
          const emptyError = new Error('Réponse vide de l\'API');
          console.warn(`[ChatService] Réponse vide reçue - Tentative ${attempt}/${RETRY_CONFIG.maxAttempts}`);
          
          if (attempt < RETRY_CONFIG.maxAttempts) {
            lastError = emptyError;
            await this.delay(attempt);
            continue;
          }
          
          throw emptyError;
        }
        
        console.log(`[ChatService] Succès à la tentative ${attempt}`);
        return responseText;
        
      } catch (error) {
        console.error(`[ChatService] Erreur tentative ${attempt}:`, error);
        lastError = error;
        
        // Si c'est une erreur non-récupérable, on arrête immédiatement
        if (!this.isRetryableError(error)) {
          console.error(`[ChatService] Erreur non-récupérable, arrêt des tentatives:`, error);
          throw error;
        }
        
        // Si c'est la dernière tentative, on lance l'erreur
        if (attempt === RETRY_CONFIG.maxAttempts) {
          console.error(`[ChatService] Échec après ${RETRY_CONFIG.maxAttempts} tentatives`);
          throw error;
        }
        
        // Attendre avant la prochaine tentative
        await this.delay(attempt);
      }
    }
    
    // Fallback (ne devrait jamais arriver)
    throw lastError || new Error('Erreur inconnue lors du retry');
  }

  /**
   * Envoie un message à l'API Olivia avec système de retry intelligent
   */
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.executeRequestWithRetry(messages);
    } catch (error) {
      console.error('[ChatService] Erreur finale après tous les retries:', error);
      
      // Messages d'erreur personnalisés et diversifiés selon le type d'erreur
      if (error instanceof Error) {
        if ((error as any).status === 503) {
          // Messages variés pour erreur 503 côté mobile
          const fallbackMessages = [
            'Le service est temporairement surchargé. En attendant, prenez quelques respirations profondes.',
            'Je fais face à un pic d\'activité. Essayez à nouveau dans un moment ou explorez les exercices de détente.',
            'Mon système est momentanément saturé. Profitez-en pour faire une pause et revenez dans quelques instants.'
          ];
          const messageIndex = Math.floor(Date.now() / 45000) % fallbackMessages.length;
          throw new Error(fallbackMessages[messageIndex]);
        } else if ((error as any).status === 401 || (error as any).status === 403) {
          throw new Error('Erreur d\'authentification. Veuillez vous reconnecter.');
        } else if (error.message.includes('fetch')) {
          throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.');
        }
      }
      
      throw new Error(`Erreur technique: ${error instanceof Error ? error.message : 'Inconnue'}`);
    }
  }

  /**
   * Détecte les mots-clés d'urgence
   */
  containsEmergencyKeyword(text: string): boolean {
    const emergencyKeywords = [
      "suicide", "je veux mourir", "tuer", "plus envie de vivre", "violence",
      "je me fais mal", "je suis en danger", "j'ai besoin d'aide", "je vais mal",
      "pensées suicidaires", "on m'a agressé", "je me sens en insécurité",
    ];
    
    return emergencyKeywords.some(word => text.toLowerCase().includes(word));
  }

  /**
   * Génère un titre pour une conversation
   */
  generateConversationTitle(messages: ChatMessage[]): string {
    if (messages.length < 2) return "Nouvelle conversation";
    
    const userMessages = messages.filter(msg => msg.from === "user");
    if (userMessages.length === 0) return "Nouvelle conversation";
    
    const firstUserMessage = userMessages[0].text;
    return firstUserMessage.length > 50
      ? firstUserMessage.substring(0, 50) + "..."
      : firstUserMessage;
  }
}

export const chatService = ChatService.getInstance();