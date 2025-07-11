import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  onActionPress?: (actionName: string, params: any) => void;
}

export default function MessageBubble({ message, onActionPress }: MessageBubbleProps) {
  const isUser = message.from === 'user';
  
  // DEBUG: Log du message dans MessageBubble
  console.log('[DEBUG] MessageBubble rendu:', {
    id: message.id,
    from: message.from,
    text: message.text?.substring(0, 100),
    displayText: message.displayText?.substring(0, 100),
    textLength: message.text?.length || 0,
    displayTextLength: message.displayText?.length || 0,
    hasText: !!message.text,
    hasDisplayText: !!message.displayText,
    textEmpty: !message.text || message.text.trim() === '',
    displayTextEmpty: !message.displayText || message.displayText.trim() === ''
  });
  
  const formatResponse = (text: string) => {
    if (!text) {
      console.warn('[DEBUG] formatResponse - Texte vide reçu');
      return '';
    }
    
    // Nettoyage basique du texte (enlever markdown)
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Enlever le gras markdown
      .replace(/\*(.*?)\*/g, '$1')     // Enlever l'italique markdown
      .trim();
    
    // DEBUG: Log du formatage
    if (formatted !== text) {
      console.log('[DEBUG] formatResponse - Texte formaté:', {
        original: text.substring(0, 50),
        formatted: formatted.substring(0, 50),
        originalLength: text.length,
        formattedLength: formatted.length
      });
    }
    
    return formatted;
  };

  const getActionIcon = (actionName: string) => {
    switch (actionName) {
      case 'EXERCICE_RESPIRATION':
        return 'flash';
      case 'VOYAGE_SONORE':
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
  };

  const getActionLabel = (actionName: string) => {
    switch (actionName) {
      case 'EXERCICE_RESPIRATION':
        return 'Pratiquer';
      case 'VOYAGE_SONORE':
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
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {formatResponse(message.displayText || message.text)}
        </Text>
      </View>
      
      {/* Bouton d'action pour les messages d'Olivia */}
      {!isUser && message.actionName && message.actionParams && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onActionPress(message.actionName!, message.actionParams)}
        >
          <Ionicons 
            name={getActionIcon(message.actionName) as any} 
            size={16} 
            color="#007AFF" 
          />
          <Text style={styles.actionText}>
            {getActionLabel(message.actionName)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#000000',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  actionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});