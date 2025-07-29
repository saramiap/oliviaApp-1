import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '@/services/storageService';
import SwipeableJournalEntry from '@/components/SwipeableJournalEntry';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
}

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Joyeux' },
    { emoji: '😌', label: 'Serein' },
    { emoji: '😔', label: 'Triste' },
    { emoji: '😰', label: 'Anxieux' },
    { emoji: '😡', label: 'Frustré' },
    { emoji: '🤔', label: 'Réfléchi' },
  ];

  useEffect(() => {
    loadEntries();
    checkForSuggestion();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await storageService.get<JournalEntry[]>('journalEntries') || [];
      setEntries(savedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Erreur lors du chargement des entrées:', error);
    }
  };

  const checkForSuggestion = async () => {
    try {
      const suggestion = await storageService.get<string>('journalPromptSuggestion');
      if (suggestion) {
        Alert.alert(
          'Suggestion d\'Olivia',
          `Olivia suggère d'écrire sur : ${suggestion}`,
          [
            { text: 'Plus tard', style: 'cancel' },
            { 
              text: 'Écrire maintenant', 
              onPress: () => {
                setCurrentTitle(suggestion);
                setShowNewEntry(true);
                storageService.remove('journalPromptSuggestion');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de suggestion:', error);
    }
  };

  const saveEntry = async () => {
    if (!currentEntry.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire quelque chose avant de sauvegarder.');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: currentTitle.trim() || `Entrée du ${new Date().toLocaleDateString('fr-FR')}`,
      content: currentEntry.trim(),
      date: new Date().toISOString(),
      mood: selectedMood,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    try {
      await storageService.set('journalEntries', updatedEntries);
      setCurrentEntry('');
      setCurrentTitle('');
      setSelectedMood('');
      setShowNewEntry(false);
      Alert.alert('Succès', 'Votre entrée a été sauvegardée.');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre entrée.');
    }
  };

  const deleteEntry = async (entryId: string) => {
    Alert.alert(
      'Supprimer l\'entrée',
      'Êtes-vous sûr de vouloir supprimer cette entrée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = entries.filter(entry => entry.id !== entryId);
            setEntries(updatedEntries);
            await storageService.set('journalEntries', updatedEntries);
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showNewEntry) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowNewEntry(false)}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle entrée</Text>
          <TouchableOpacity onPress={saveEntry}>
            <Text style={styles.saveButton}>Sauver</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={styles.titleInput}
            placeholder="Titre de votre entrée..."
            value={currentTitle}
            onChangeText={setCurrentTitle}
            maxLength={100}
          />

          <Text style={styles.sectionTitle}>Comment vous sentez-vous ?</Text>
          <View style={styles.moodContainer}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.label}
                style={[
                  styles.moodButton,
                  selectedMood === mood.label && styles.selectedMood
                ]}
                onPress={() => setSelectedMood(selectedMood === mood.label ? '' : mood.label)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.contentInput}
            placeholder="Écrivez vos pensées, sentiments, ou tout ce qui vous passe par la tête..."
            value={currentEntry}
            onChangeText={setCurrentEntry}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Journal</Text>
        <TouchableOpacity 
          style={styles.newEntryButton}
          onPress={() => setShowNewEntry(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>Votre journal est vide</Text>
            <Text style={styles.emptyStateText}>
              Commencez à écrire vos pensées et sentiments. C'est un espace privé pour vous.
            </Text>
            <TouchableOpacity 
              style={styles.startWritingButton}
              onPress={() => setShowNewEntry(true)}
            >
              <Text style={styles.startWritingText}>Commencer à écrire</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry) => (
            <SwipeableJournalEntry
              key={entry.id}
              entry={entry}
              onDelete={deleteEntry}
              moods={moods}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  newEntryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 80,
  },
  selectedMood: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  startWritingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startWritingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});