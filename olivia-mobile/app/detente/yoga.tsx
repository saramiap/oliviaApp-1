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

interface YogaSession {
  id: string;
  title: string;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  description: string;
  benefits: string[];
  icon: string;
  color: string;
}

const yogaSessions: YogaSession[] = [
  {
    id: 'morning-flow',
    title: 'Flow Matinal',
    duration: '15 min',
    level: 'Débutant',
    description: 'Une séquence douce pour commencer la journée en beauté',
    benefits: ['Réveil en douceur', 'Étirements', 'Énergie positive'],
    icon: 'sunny',
    color: '#FF9500'
  },
  {
    id: 'stress-relief',
    title: 'Anti-Stress',
    duration: '20 min',
    level: 'Débutant',
    description: 'Postures relaxantes pour évacuer les tensions',
    benefits: ['Réduction du stress', 'Relaxation profonde', 'Calme mental'],
    icon: 'leaf',
    color: '#4CAF50'
  },
  {
    id: 'strength-building',
    title: 'Renforcement',
    duration: '25 min',
    level: 'Intermédiaire',
    description: 'Séquence pour renforcer le corps et l\'esprit',
    benefits: ['Tonus musculaire', 'Force intérieure', 'Équilibre'],
    icon: 'fitness',
    color: '#2196F3'
  },
  {
    id: 'evening-relax',
    title: 'Détente du Soir',
    duration: '18 min',
    level: 'Débutant',
    description: 'Yoga réparateur pour une nuit paisible',
    benefits: ['Préparation au sommeil', 'Détente musculaire', 'Paix intérieure'],
    icon: 'moon',
    color: '#9C27B0'
  },
  {
    id: 'flexibility',
    title: 'Souplesse',
    duration: '30 min',
    level: 'Intermédiaire',
    description: 'Améliorer la flexibilité et la mobilité',
    benefits: ['Souplesse accrue', 'Mobilité articulaire', 'Bien-être corporel'],
    icon: 'accessibility',
    color: '#FF5722'
  },
  {
    id: 'advanced-flow',
    title: 'Flow Avancé',
    duration: '40 min',
    level: 'Avancé',
    description: 'Séquence dynamique pour yogis expérimentés',
    benefits: ['Défi personnel', 'Maîtrise technique', 'Accomplissement'],
    icon: 'trophy',
    color: '#607D8B'
  }
];

export default function YogaScreen() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filteredSessions = selectedLevel 
    ? yogaSessions.filter(session => session.level === selectedLevel)
    : yogaSessions;

  const startSession = (session: YogaSession) => {
    Alert.alert(
      `${session.title}`,
      `Prêt(e) à commencer cette séance de ${session.duration} ?`,
      [
        { text: 'Plus tard', style: 'cancel' },
        {
          text: 'Commencer',
          onPress: () => {
            // Ici on pourrait naviguer vers une page de session guidée
            Alert.alert('Session démarrée', `Bonne séance de ${session.title} !`);
          }
        }
      ]
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return '#4CAF50';
      case 'Intermédiaire': return '#FF9800';
      case 'Avancé': return '#F44336';
      default: return '#8E8E93';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programme Yoga</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <Ionicons name="body" size={48} color="#9C27B0" />
          </View>
          <Text style={styles.introTitle}>Trouvez votre équilibre</Text>
          <Text style={styles.introText}>
            Découvrez nos séances de yoga adaptées à tous les niveaux. 
            Que vous soyez débutant ou expérimenté, trouvez la pratique qui vous convient.
          </Text>
        </View>

        {/* Filtres par niveau */}
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Filtrer par niveau</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            <TouchableOpacity
              style={[styles.filterChip, selectedLevel === null && styles.filterChipActive]}
              onPress={() => setSelectedLevel(null)}
            >
              <Text style={[styles.filterText, selectedLevel === null && styles.filterTextActive]}>
                Tous
              </Text>
            </TouchableOpacity>
            {['Débutant', 'Intermédiaire', 'Avancé'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.filterChip, selectedLevel === level && styles.filterChipActive]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text style={[styles.filterText, selectedLevel === level && styles.filterTextActive]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des séances */}
        <View style={styles.sessionsSection}>
          <Text style={styles.sessionsTitle}>
            {selectedLevel ? `Séances ${selectedLevel.toLowerCase()}s` : 'Toutes les séances'}
          </Text>
          
          {filteredSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[styles.sessionCard, { borderLeftColor: session.color }]}
              onPress={() => startSession(session)}
              activeOpacity={0.7}
            >
              <View style={styles.sessionHeader}>
                <View style={[styles.sessionIcon, { backgroundColor: `${session.color}20` }]}>
                  <Ionicons name={session.icon as any} size={24} color={session.color} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={styles.sessionDuration}>
                      <Ionicons name="time" size={12} color="#8E8E93" /> {session.duration}
                    </Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(session.level) }]}>
                      <Text style={styles.levelText}>{session.level}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="play-circle" size={32} color={session.color} />
              </View>
              
              <Text style={styles.sessionDescription}>{session.description}</Text>
              
              <View style={styles.benefitsContainer}>
                {session.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitTag}>
                    <Text style={styles.benefitText}>✨ {benefit}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conseils pratiques */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Conseils pour bien pratiquer</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Avant de commencer</Text>
            <Text style={styles.tipText}>
              • Trouvez un espace calme et confortable{'\n'}
              • Portez des vêtements souples{'\n'}
              • Ayez un tapis ou une surface antidérapante{'\n'}
              • Restez hydraté(e)
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Pendant la pratique</Text>
            <Text style={styles.tipText}>
              • Écoutez votre corps{'\n'}
              • Respirez profondément{'\n'}
              • Ne forcez jamais les postures{'\n'}
              • Restez concentré(e) et présent(e)
            </Text>
          </View>
        </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  introIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginTop: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sessionsSection: {
    padding: 16,
    marginTop: 12,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#8E8E93',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sessionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benefitTag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  tipsSection: {
    padding: 16,
    paddingTop: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#9C27B0',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});