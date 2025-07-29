import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JournalingExerciseProps {
  title: string;
  description: string;
  params: {
    prompt?: string;
    placeholder?: string;
  };
  onComplete: () => void;
}

export default function JournalingExercise({ 
  title, 
  description, 
  params, 
  onComplete 
}: JournalingExerciseProps) {
  const { 
    prompt = "Qu'est-ce qui occupe vos pensées en ce moment ?", 
    placeholder = "Écrivez librement ici..."
  } = params;

  const [entryText, setEntryText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const handleTextChange = (text: string) => {
    setEntryText(text);
    if (isCompleted) setIsCompleted(false);
  };

  const handleMarkAsDone = () => {
    console.log("Texte du journal (pour cette activité):", entryText);
    setIsCompleted(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.journalingContainer}>
        <View style={styles.promptContainer}>
          <Ionicons name="create" size={28} color="#FF9800" />
          <Text style={styles.promptText}>{prompt}</Text>
        </View>

        <TextInput
          style={styles.textArea}
          placeholder={placeholder}
          value={entryText}
          onChangeText={handleTextChange}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          placeholderTextColor="#8E8E93"
        />

        <View style={styles.wordCount}>
          <Text style={styles.wordCountText}>
            {entryText.trim().split(/\s+/).filter(word => word.length > 0).length} mots
          </Text>
        </View>

        {!isCompleted ? (
          <TouchableOpacity 
            style={[
              styles.doneButton,
              !entryText.trim() && styles.doneButtonDisabled
            ]}
            onPress={handleMarkAsDone}
            disabled={!entryText.trim()}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.doneButtonText}>
              J'ai noté mes pensées
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedSection}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.completedText}>Noté !</Text>
            <Text style={styles.completedSubtext}>
              Merci d'avoir pris le temps d'exprimer vos pensées
            </Text>
          </View>
        )}

        <View style={styles.tipSection}>
          <Ionicons name="bulb-outline" size={20} color="#FF9800" />
          <Text style={styles.tipText}>
            Prenez votre temps, il n'y a pas de bonne ou mauvaise façon d'écrire. 
            L'important est de laisser vos pensées s'exprimer librement.
          </Text>
        </View>

        {isCompleted && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={onComplete}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Continuer</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  journalingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  promptText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    minHeight: 120,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
    lineHeight: 22,
  },
  wordCount: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  wordCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20,
  },
  doneButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginBottom: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
    marginBottom: 4,
  },
  completedSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  tipSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});