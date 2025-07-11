import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextualChatMessage, ContextualAction } from '@/types/chat';
import MessageBubble from './MessageBubble';
import SimpleActionButton from './SimpleActionButton';
import SoundJourneyPreview from './contextual/SoundJourneyPreview';
import BreathingPreview from './contextual/BreathingPreview';
import JournalPreview from './contextual/JournalPreview';

interface ContextualMessageBubbleProps {
  message: ContextualChatMessage;
  onActionPress?: (actionName: string, params: any) => void;
  onDelete?: (messageId: string) => void;
  showDeleteOption?: boolean;
}

export default function ContextualMessageBubble({ 
  message, 
  onActionPress, 
  onDelete,
  showDeleteOption = false 
}: ContextualMessageBubbleProps) {
  const isUser = message.from === 'user';

  // Si c'est un message utilisateur ou sans action contextuelle, 
  // utiliser le MessageBubble standard
  if (isUser || !message.contextualAction) {
    return (
      <MessageBubble 
        message={message} 
        onActionPress={onActionPress}
      />
    );
  }

  const { contextualAction } = message;

  return (
    <View style={styles.container}>
      {/* Bubble de message standard */}
      <MessageBubble 
        message={message} 
        onActionPress={undefined} // On ne veut pas le bouton standard
      />
      
      {/* Interface contextuelle */}
      <View style={styles.contextualInterface}>
        {renderContextualInterface(contextualAction, onActionPress)}
      </View>
    </View>
  );
}

/**
 * Rendu de l'interface contextuelle selon le type
 */
function renderContextualInterface(
  action: ContextualAction, 
  onActionPress?: (actionName: string, params: any) => void
) {
  switch (action.contextType) {
    case 'simple':
      return (
        <SimpleActionButton
          action={action}
          onPress={onActionPress}
        />
      );
    
    case 'preview':
      return (
        <PreviewActionInterface
          action={action}
          onPress={onActionPress}
        />
      );
    
    case 'immersive':
      return (
        <ImmersiveActionInterface
          action={action}
          onPress={onActionPress}
        />
      );
    
    default:
      return (
        <SimpleActionButton
          action={action}
          onPress={onActionPress}
        />
      );
  }
}

/**
 * Interface de preview pour les actions moyennes
 */
function PreviewActionInterface({ 
  action, 
  onPress 
}: { 
  action: ContextualAction; 
  onPress?: (actionName: string, params: any) => void;
}) {
  const { metadata } = action;

  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>{metadata?.title}</Text>
        <Text style={styles.previewDescription}>{metadata?.description}</Text>
      </View>
      
      {/* Données de preview selon le type */}
      {renderPreviewData(action)}
      
      <TouchableOpacity
        style={styles.previewActionButton}
        onPress={() => onPress?.(action.type, action.params)}
      >
        <Ionicons 
          name={getActionIcon(action.type)} 
          size={20} 
          color="#FFFFFF" 
        />
        <Text style={styles.previewActionText}>
          {getActionLabel(action.type)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Interface immersive pour les actions complexes (Phase 2)
 */
function ImmersiveActionInterface({
  action,
  onPress
}: {
  action: ContextualAction;
  onPress?: (actionName: string, params: any) => void;
}) {
  // Phase 2: Interface immersive spécialisée pour les voyages sonores
  if (action.type === 'VOYAGE_SONORE') {
    return (
      <SoundJourneyPreview
        params={action.params}
        onAction={onPress || (() => {})}
      />
    );
  }
  
  // Phase 3: Interface immersive pour les exercices de respiration
  if (action.type === 'EXERCICE_RESPIRATION') {
    return (
      <BreathingPreview
        params={action.params}
        onAction={onPress || (() => {})}
      />
    );
  }
  
  // Phase 3: Interface immersive pour les suggestions de journal
  if (action.type === 'SUGGESTION_JOURNAL') {
    return (
      <JournalPreview
        params={action.params}
        onAction={onPress || (() => {})}
      />
    );
  }
  
  // Pour les autres types d'actions, utiliser l'interface preview
  return (
    <View style={styles.immersivePlaceholder}>
      <Text style={styles.immersivePlaceholderText}>
        Interface immersive (Phase 3)
      </Text>
      <PreviewActionInterface action={action} onPress={onPress} />
    </View>
  );
}

/**
 * Rendu des données de preview selon le type d'action
 */
function renderPreviewData(action: ContextualAction) {
  const { previewData } = action.metadata || {};
  
  if (!previewData) return null;

  switch (action.type) {
    case 'VOYAGE_SONORE':
    case 'NAVIGATE_FULL_SOUND_JOURNEY':
    case 'QUICK_PLAY_SOUND_JOURNEY':
      return (
        <View style={styles.previewData}>
          <View style={styles.previewDataItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.previewDataText}>
              {Math.round(previewData.duration / 60)} min
            </Text>
          </View>
          {previewData.themeId && (
            <View style={styles.previewDataItem}>
              <Ionicons name="leaf" size={16} color="#666" />
              <Text style={styles.previewDataText}>
                {getThemeName(previewData.themeId)}
              </Text>
            </View>
          )}
        </View>
      );

    case 'EXERCICE_RESPIRATION':
      return (
        <View style={styles.previewData}>
          <View style={styles.previewDataItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.previewDataText}>
              {Math.round(previewData.duration / 60)} min
            </Text>
          </View>
          {previewData.cycles && (
            <View style={styles.previewDataItem}>
              <Ionicons name="refresh" size={16} color="#666" />
              <Text style={styles.previewDataText}>
                {previewData.cycles} cycles
              </Text>
            </View>
          )}
        </View>
      );

    case 'SUGGESTION_JOURNAL':
      return previewData.prompt ? (
        <View style={styles.previewData}>
          <Text style={styles.previewPrompt}>
            "{previewData.prompt}"
          </Text>
        </View>
      ) : null;

    default:
      return null;
  }
}

/**
 * Obtient l'icône pour un type d'action
 */
function getActionIcon(actionType: string): keyof typeof Ionicons.glyphMap {
  switch (actionType) {
    case 'EXERCICE_RESPIRATION':
      return 'flash';
    case 'VOYAGE_SONORE':
    case 'NAVIGATE_FULL_SOUND_JOURNEY':
    case 'QUICK_PLAY_SOUND_JOURNEY':
      return 'musical-notes';
    case 'SUGGESTION_JOURNAL':
      return 'book';
    case 'INFO_STRESS':
      return 'information-circle';
    case 'REDIRECT':
      return 'arrow-forward';
    default:
      return 'ellipse';
  }
}

/**
 * Obtient le label pour un type d'action
 */
function getActionLabel(actionType: string): string {
  switch (actionType) {
    case 'EXERCICE_RESPIRATION':
      return 'Pratiquer';
    case 'VOYAGE_SONORE':
    case 'NAVIGATE_FULL_SOUND_JOURNEY':
    case 'QUICK_PLAY_SOUND_JOURNEY':
      return 'Écouter';
    case 'SUGGESTION_JOURNAL':
      return 'Écrire';
    case 'INFO_STRESS':
      return 'En savoir plus';
    case 'REDIRECT':
      return 'Voir';
    default:
      return 'Action';
  }
}

/**
 * Obtient le nom d'un thème
 */
function getThemeName(themeId: string): string {
  const themes: Record<string, string> = {
    'forest': 'Forêt',
    'ocean': 'Océan',
    'rain': 'Pluie',
    'fire': 'Feu de cheminée',
    'mountain': 'Montagne'
  };
  
  return themes[themeId] || 'Thème personnalisé';
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  contextualInterface: {
    marginTop: 8,
    marginLeft: 16,
    marginRight: 16,
  },
  
  // Styles pour l'interface preview
  previewContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  previewData: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  previewDataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewDataText: {
    fontSize: 14,
    color: '#495057',
  },
  previewPrompt: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#495057',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  previewActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  previewActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Styles pour l'interface immersive (placeholder Phase 1)
  immersivePlaceholder: {
    opacity: 0.7,
  },
  immersivePlaceholderText: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
});