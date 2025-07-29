import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '@/types/chat';

interface DeletableMessageBubbleProps {
  message: ChatMessage;
  onActionPress?: (actionName: string, params: any) => void;
  onDelete?: (messageId: string) => void;
  showDeleteOption?: boolean;
}

export default function DeletableMessageBubble({ 
  message, 
  onActionPress, 
  onDelete,
  showDeleteOption = false 
}: DeletableMessageBubbleProps) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const isUser = message.from === 'user';
  
  const formatResponse = (text: string) => {
    if (!text) return '';
    
    // Nettoyage basique du texte (enlever markdown)
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Enlever le gras markdown
      .replace(/\*(.*?)\*/g, '$1')     // Enlever l'italique markdown
      .trim();
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

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le message",
      "Êtes-vous sûr de vouloir supprimer ce message ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            if (onDelete && message.id) {
              onDelete(message.id);
            }
          }
        }
      ]
    );
  };

  const handleLongPress = () => {
    if (showDeleteOption) {
      setShowDeleteButton(!showDeleteButton);
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={styles.messageWrapper}
      >
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
            {formatResponse(message.displayText || message.text)}
          </Text>
        </View>
        
        {/* Bouton de suppression */}
        {showDeleteButton && showDeleteOption && (
          <TouchableOpacity
            style={[styles.deleteButton, isUser ? styles.deleteButtonUser : styles.deleteButtonAI]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
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
  messageWrapper: {
    position: 'relative',
    maxWidth: '80%',
  },
  bubble: {
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
  deleteButton: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  deleteButtonUser: {
    right: -8,
  },
  deleteButtonAI: {
    left: -8,
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