import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { storageService } from '@/services/storageService';

// Import des composants stress
import BreathingExercise from '@/components/stress/BreathingExercise';
import CoherenceCardiac from '@/components/stress/CoherenceCardiac';
import Grounding54321 from '@/components/stress/Grounding54321';
import JournalingExercise from '@/components/stress/JournalingExercise';
import QuoteDisplay from '@/components/stress/QuoteDisplay';

interface StressActivity {
  id: string;
  type: 'breathing' | 'coherence' | 'grounding' | 'journaling' | 'quote';
  title: string;
  description: string;
  params: any;
  duration?: number; // en minutes
}

const stressProgramActivities: StressActivity[] = [
  {
    id: 'breathing-478',
    type: 'breathing',
    title: 'Respiration 4-7-8',
    description: 'Technique de respiration pour apaiser le système nerveux',
    params: {
      cycles: 4,
      inspire: 4,
      hold: 7,
      expire: 8,
      instructions: [
        'Placez le bout de votre langue contre vos dents de devant',
        'Expirez complètement par la bouche',
        'Fermez la bouche et inspirez par le nez pendant 4 secondes',
        'Retenez votre souffle pendant 7 secondes',
        'Expirez complètement par la bouche pendant 8 secondes'
      ]
    },
    duration: 5
  },
  {
    id: 'coherence-cardiac',
    type: 'coherence',
    title: 'Cohérence Cardiaque',
    description: 'Synchronisation cœur-cerveau pour réduire le stress',
    params: {
      duration: 180, // 3 minutes
      breathsPerMinute: 6
    },
    duration: 3
  },
  {
    id: 'grounding-54321',
    type: 'grounding',
    title: 'Ancrage 5-4-3-2-1',
    description: 'Technique d\'ancrage sensoriel pour revenir au présent',
    params: {
      steps: [
        {
          sense: 'VOIR',
          instruction: 'Nommez 5 choses que vous pouvez voir autour de vous',
          count: 5
        },
        {
          sense: 'TOUCHER',
          instruction: 'Identifiez 4 choses que vous pouvez toucher',
          count: 4
        },
        {
          sense: 'ENTENDRE',
          instruction: 'Écoutez et nommez 3 sons que vous entendez',
          count: 3
        },
        {
          sense: 'SENTIR (ODORAT)',
          instruction: 'Identifiez 2 odeurs que vous pouvez sentir',
          count: 2
        },
        {
          sense: 'GOÛTER',
          instruction: 'Concentrez-vous sur 1 goût dans votre bouche',
          count: 1
        }
      ]
    },
    duration: 8
  },
  {
    id: 'journaling-stress',
    type: 'journaling',
    title: 'Expression Écrite',
    description: 'Libérez vos pensées stressantes par l\'écriture',
    params: {
      prompt: 'Quelles sont les pensées qui vous préoccupent en ce moment ? Écrivez librement sans vous censurer.',
      placeholder: 'Laissez vos pensées s\'exprimer...'
    },
    duration: 10
  },
  {
    id: 'quote-motivation',
    type: 'quote',
    title: 'Citation Inspirante',
    description: 'Un moment de réflexion avec une pensée positive',
    params: {
      quote: 'Ce qui ne te tue pas te rend plus fort, mais ce qui te guérit te rend plus sage.',
      author: 'Proverbe adapté'
    },
    duration: 2
  }
];

export default function StressProgramsScreen() {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isActivityStarted, setIsActivityStarted] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [programProgress, setProgramProgress] = useState(0);

  const currentActivity = stressProgramActivities[currentActivityIndex];

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const completed = await storageService.get<string[]>('stressProgramCompleted') || [];
      setCompletedActivities(completed);
      
      const progress = (completed.length / stressProgramActivities.length) * 100;
      setProgramProgress(progress);
    } catch (error) {
      console.error('Erreur lors du chargement du progrès:', error);
    }
  };

  const handleActivityComplete = async () => {
    const newCompleted = [...completedActivities, currentActivity.id];
    setCompletedActivities(newCompleted);
    
    try {
      await storageService.set('stressProgramCompleted', newCompleted);
      
      const newProgress = (newCompleted.length / stressProgramActivities.length) * 100;
      setProgramProgress(newProgress);
      
      if (currentActivityIndex < stressProgramActivities.length - 1) {
        Alert.alert(
          'Activité terminée !',
          'Félicitations ! Voulez-vous passer à l\'activité suivante ?',
          [
            { text: 'Plus tard', style: 'cancel', onPress: () => router.back() },
            { text: 'Continuer', onPress: handleNextActivity }
          ]
        );
      } else {
        Alert.alert(
          'Programme terminé !',
          'Bravo ! Vous avez terminé toutes les activités anti-stress.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleNextActivity = () => {
    if (currentActivityIndex < stressProgramActivities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
      setIsActivityStarted(false);
    }
  };

  const handlePreviousActivity = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1);
      setIsActivityStarted(false);
    }
  };

  const renderActivity = () => {
    if (!isActivityStarted) {
      return (
        <View style={styles.activityPreview}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>{currentActivity.title}</Text>
            <Text style={styles.activityDescription}>{currentActivity.description}</Text>
            
            <View style={styles.activityMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.metaText}>~{currentActivity.duration} min</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons 
                  name={completedActivities.includes(currentActivity.id) ? "checkmark-circle" : "radio-button-off"} 
                  size={16} 
                  color={completedActivities.includes(currentActivity.id) ? "#4CAF50" : "#8E8E93"} 
                />
                <Text style={styles.metaText}>
                  {completedActivities.includes(currentActivity.id) ? 'Terminé' : 'À faire'}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => setIsActivityStarted(true)}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Commencer l'activité</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Rendu du composant d'activité spécifique
    switch (currentActivity.type) {
      case 'breathing':
        return (
          <BreathingExercise
            title={currentActivity.title}
            description={currentActivity.description}
            params={currentActivity.params}
            onComplete={handleActivityComplete}
          />
        );
      case 'coherence':
        return (
          <CoherenceCardiac
            title={currentActivity.title}
            description={currentActivity.description}
            params={currentActivity.params}
            onComplete={handleActivityComplete}
          />
        );
      case 'grounding':
        return (
          <Grounding54321
            title={currentActivity.title}
            description={currentActivity.description}
            params={currentActivity.params}
            onComplete={handleActivityComplete}
          />
        );
      case 'journaling':
        return (
          <JournalingExercise
            title={currentActivity.title}
            description={currentActivity.description}
            params={currentActivity.params}
            onComplete={handleActivityComplete}
          />
        );
      case 'quote':
        return (
          <QuoteDisplay
            title={currentActivity.title}
            description={currentActivity.description}
            params={currentActivity.params}
            onComplete={handleActivityComplete}
          />
        );
      default:
        return <Text>Activité non reconnue</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Programme Anti-Stress</Text>
          <Text style={styles.headerSubtitle}>
            Activité {currentActivityIndex + 1} sur {stressProgramActivities.length}
          </Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${programProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(programProgress)}% terminé
        </Text>
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderActivity()}
      </ScrollView>

      {/* Navigation */}
      {isActivityStarted && (
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={[styles.navButton, currentActivityIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousActivity}
            disabled={currentActivityIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentActivityIndex === 0 ? "#8E8E93" : "#007AFF"} />
            <Text style={[styles.navButtonText, currentActivityIndex === 0 && styles.navButtonTextDisabled]}>
              Précédent
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={() => setIsActivityStarted(false)}
          >
            <Ionicons name="stop" size={20} color="#FF3B30" />
            <Text style={styles.stopButtonText}>Arrêter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, currentActivityIndex >= stressProgramActivities.length - 1 && styles.navButtonDisabled]}
            onPress={handleNextActivity}
            disabled={currentActivityIndex >= stressProgramActivities.length - 1}
          >
            <Text style={[styles.navButtonText, currentActivityIndex >= stressProgramActivities.length - 1 && styles.navButtonTextDisabled]}>
              Suivant
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentActivityIndex >= stressProgramActivities.length - 1 ? "#8E8E93" : "#007AFF"} />
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  activityPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    marginBottom: 24,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    marginBottom: 16,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  startButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  navButtonTextDisabled: {
    color: '#8E8E93',
  },
  stopButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  stopButtonText: {
    fontSize: 16,
    color: '#FF3B30',
  },
});