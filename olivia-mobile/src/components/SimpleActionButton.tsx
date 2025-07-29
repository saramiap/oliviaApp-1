import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContextualAction } from '@/types/chat';

interface SimpleActionButtonProps {
  action: ContextualAction;
  onPress?: (actionName: string, params: any) => void;
}

export default function SimpleActionButton({ 
  action, 
  onPress 
}: SimpleActionButtonProps) {
  const getActionIcon = (actionType: string): keyof typeof Ionicons.glyphMap => {
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
  };

  const getActionLabel = (actionType: string): string => {
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
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => onPress?.(action.type, action.params)}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={getActionIcon(action.type)} 
        size={20} 
        color="#007AFF" 
      />
      <Text style={styles.text}>
        {action.metadata?.title || getActionLabel(action.type)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});