import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Design';

// Import des composants d'exercices
import BreathingExercise from '@/components/stress/BreathingExercise';
import CoherenceCardiac from '@/components/stress/CoherenceCardiac';
import EnhancedBreathingExercise from '@/components/respiration/EnhancedBreathingExercise';

interface BreathingExerciseType {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  benefits: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient: string[];
  type: 'breathing-478' | 'coherence' | 'box-breathing' | 'deep-breathing' | 'alternate-breathing' | 'emergency-breathing';
  params: any;
}

const breathingExercises: BreathingExerciseType[] = [
  {
    id: 'breathing-478',
    title: 'Respiration 4-7-8',
    description: 'Technique de relaxation pour calmer le système nerveux et favoriser l\'endormissement',
    duration: '5-8 min',
    difficulty: 'Débutant',
    benefits: ['Réduction du stress', 'Améliore le sommeil', 'Calme l\'anxiété'],
    icon: 'moon',
    color: Colors.spiritual[500],
    gradient: [Colors.spiritual[400], Colors.spiritual[600]],
    type: 'breathing-478',
    params: {
      cycles: 4,
      inspire: 4,
      hold: 7,
      expire: 8,
      instructions: [
        'Placez le bout de votre langue contre vos dents de devant',
        'Expirez complètement par la bouche en faisant un "whoosh"',
        'Fermez la bouche et inspirez par le nez pendant 4 secondes',
        'Retenez votre souffle pendant 7 secondes',
        'Expirez complètement par la bouche pendant 8 secondes'
      ]
    }
  },
  {
    id: 'coherence-cardiac',
    title: 'Cohérence Cardiaque',
    description: 'Synchronisation cœur-cerveau pour équilibrer le système nerveux autonome',
    duration: '3-10 min',
    difficulty: 'Débutant',
    benefits: ['Réduction du stress', 'Équilibre émotionnel', 'Améliore la concentration'],
    icon: 'heart',
    color: Colors.nature[500],
    gradient: [Colors.nature[400], Colors.nature[600]],
    type: 'coherence',
    params: {
      duration: 300, // 5 minutes par défaut
      breathsPerMinute: 6
    }
  },
  {
    id: 'box-breathing',
    title: 'Respiration Carrée',
    description: 'Technique 4-4-4-4 utilisée par les forces spéciales pour gérer le stress',
    duration: '5-10 min',
    difficulty: 'Intermédiaire',
    benefits: ['Contrôle du stress', 'Améliore la concentration', 'Renforce la discipline mentale'],
    icon: 'square',
    color: Colors.primary[500],
    gradient: [Colors.primary[400], Colors.primary[600]],
    type: 'box-breathing',
    params: {
      cycles: 8,
      inspire: 4,
      hold: 4,
      expire: 4,
      holdEmpty: 4,
      instructions: [
        'Asseyez-vous confortablement, le dos droit',
        'Expirez complètement pour vider vos poumons',
        'Inspirez par le nez pendant 4 secondes',
        'Retenez votre souffle pendant 4 secondes',
        'Expirez par la bouche pendant 4 secondes',
        'Restez poumons vides pendant 4 secondes'
      ]
    }
  },
  {
    id: 'deep-breathing',
    title: 'Respiration Profonde',
    description: 'Technique simple de respiration diaphragmatique pour se recentrer rapidement',
    duration: '3-5 min',
    difficulty: 'Débutant',
    benefits: ['Relaxation immédiate', 'Oxygénation optimale', 'Ancrage dans le présent'],
    icon: 'leaf',
    color: Colors.nature[400],
    gradient: [Colors.nature[300], Colors.nature[500]],
    type: 'deep-breathing',
    params: {
      cycles: 10,
      inspire: 6,
      hold: 2,
      expire: 8,
      instructions: [
        'Placez une main sur votre poitrine, l\'autre sur votre ventre',
        'Respirez lentement par le nez en gonflant le ventre',
        'Sentez votre diaphragme s\'abaisser',
        'Expirez lentement par la bouche',
        'Seule la main sur le ventre doit bouger'
      ]
    }
  },
  {
    id: 'alternate-breathing',
    title: 'Respiration Alternée',
    description: 'Technique yogique Nadi Shodhana pour équilibrer les énergies',
    duration: '5-10 min',
    difficulty: 'Avancé',
    benefits: ['Équilibre énergétique', 'Améliore la concentration', 'Harmonise le mental'],
    icon: 'infinite',
    color: Colors.warm[500],
    gradient: [Colors.warm[400], Colors.warm[600]],
    type: 'alternate-breathing',
    params: {
      cycles: 12,
      inspire: 4,
      hold: 2,
      expire: 6,
      instructions: [
        'Utilisez votre pouce droit pour fermer la narine droite',
        'Inspirez par la narine gauche pendant 4 secondes',
        'Fermez la narine gauche avec l\'annulaire',
        'Ouvrez la narine droite et expirez pendant 6 secondes',
        'Inspirez par la narine droite, puis changez de côté'
      ]
    }
  },
  {
    id: 'emergency-breathing',
    title: 'Respiration Anti-Stress',
    description: 'Technique d\'urgence pour gérer les crises d\'anxiété et reprendre le contrôle',
    duration: '2-3 min',
    difficulty: 'Débutant',
    benefits: ['Soulagement immédiat', 'Gestion de crise', 'Retour au calme rapide'],
    icon: 'medical',
    color: Colors.error,
    gradient: ['#FF6B6B', '#EE5A52'],
    type: 'emergency-breathing',
    params: {
      cycles: 6,
      inspire: 3,
      hold: 1,
      expire: 5,
      instructions: [
        'Cette technique est pour les moments de stress intense',
        'Concentrez-vous uniquement sur votre respiration',
        'Inspirez lentement par le nez pendant 3 secondes',
        'Retenez brièvement pendant 1 seconde',
        'Expirez lentement par la bouche pendant 5 secondes',
        'Répétez jusqu\'à retrouver votre calme'
      ]
    }
  }
];

export default function RespirationScreen() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExerciseType | null>(null);
  const [duration, setDuration] = useState<number>(300); // 5 minutes par défaut pour cohérence cardiaque
  
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleExerciseSelect = (exercise: BreathingExerciseType) => {
    // Adapter la durée pour la cohérence cardiaque selon la sélection
    if (exercise.type === 'coherence') {
      exercise.params.duration = duration;
    }
    setSelectedExercise(exercise);
  };

  const handleExerciseComplete = () => {
    setSelectedExercise(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return Colors.nature[500];
      case 'Intermédiaire': return Colors.warm[500];
      case 'Avancé': return Colors.error;
      default: return Colors.text.secondary;
    }
  };

  const renderExerciseComponent = () => {
    if (!selectedExercise) return null;

    switch (selectedExercise.type) {
      case 'breathing-478':
        return (
          <BreathingExercise
            title={selectedExercise.title}
            description={selectedExercise.description}
            params={selectedExercise.params}
            onComplete={handleExerciseComplete}
          />
        );
      case 'box-breathing':
      case 'deep-breathing':
      case 'alternate-breathing':
      case 'emergency-breathing':
        return (
          <EnhancedBreathingExercise
            title={selectedExercise.title}
            description={selectedExercise.description}
            type={selectedExercise.type}
            params={selectedExercise.params}
            onComplete={handleExerciseComplete}
          />
        );
      case 'coherence':
        return (
          <CoherenceCardiac
            title={selectedExercise.title}
            description={selectedExercise.description}
            params={selectedExercise.params}
            onComplete={handleExerciseComplete}
          />
        );
      default:
        return null;
    }
  };

  if (selectedExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Header simplifié pour l'exercice en cours */}
        <View style={styles.exerciseHeader}>
          <TouchableOpacity 
            onPress={() => setSelectedExercise(null)}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.exerciseHeaderTitle}>Exercice en cours</Text>
          <View style={styles.headerRight} />
        </View>

        {renderExerciseComponent()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header avec gradient */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.nature[400], Colors.primary[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.background.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Exercices de Respiration</Text>
            <Text style={styles.headerSubtitle}>
              Retrouvez votre sérénité grâce à des techniques de respiration guidées
            </Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          
          {/* Liste des exercices */}
          <View style={styles.exercisesSection}>
            
            {breathingExercises.map((exercise, index) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => handleExerciseSelect(exercise)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[exercise.color + '20', exercise.color + '10']}
                  style={styles.exerciseCardGradient}
                >
                  <View style={styles.exerciseCardHeader}>
                    <View style={[styles.exerciseIcon, { backgroundColor: exercise.color + '30' }]}>
                      <Ionicons name={exercise.icon} size={28} color={exercise.color} />
                    </View>
                    
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                      <View style={styles.exerciseMeta}>
                        <Text style={styles.exerciseDuration}>
                          <Ionicons name="time" size={12} color={Colors.text.secondary} /> {exercise.duration}
                        </Text>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
                          <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <Ionicons name="play-circle" size={36} color={exercise.color} />
                  </View>
                  
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  
                  <View style={styles.benefitsContainer}>
                    {exercise.benefits.map((benefit, benefitIndex) => (
                      <View key={benefitIndex} style={styles.benefitTag}>
                        <Text style={styles.benefitText}>✨ {benefit}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conseils pratiques */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 Conseils pour bien respirer</Text>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>🌅 Meilleur moment</Text>
              <Text style={styles.tipText}>
                • Le matin au réveil pour bien commencer la journée{'\n'}
                • En fin d'après-midi pour évacuer le stress{'\n'}
                • Le soir avant de dormir pour se détendre{'\n'}
                • En cas de stress ou d'anxiété
              </Text>
            </View>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>🏞️ Environnement idéal</Text>
              <Text style={styles.tipText}>
                • Trouvez un endroit calme et confortable{'\n'}
                • Éteignez les notifications{'\n'}
                • Assurez-vous d'avoir de l'air frais{'\n'}
                • Adoptez une posture droite mais détendue
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>⚠️ Précautions</Text>
              <Text style={styles.tipText}>
                • Arrêtez si vous ressentez des vertiges{'\n'}
                • Respirez naturellement entre les exercices{'\n'}
                • Ne forcez jamais votre respiration{'\n'}
                • Consultez un professionnel en cas de problème respiratoire
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerGradient: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background.primary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.background.primary + 'E0',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  exerciseHeaderTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  durationSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  durationButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    ...Shadows.small,
  },
  durationButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  durationButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  durationButtonTextActive: {
    color: Colors.background.primary,
  },
  exercisesSection: {
    marginBottom: Spacing.xl,
  },
  exerciseCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  exerciseCardGradient: {
    backgroundColor: Colors.background.primary,
    padding: Spacing.lg,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exerciseDuration: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.background.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  exerciseDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  benefitTag: {
    backgroundColor: Colors.background.tertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  benefitText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.nature[600],
    fontWeight: Typography.fontWeight.medium,
  },
  tipsSection: {
    paddingTop: Spacing.md,
  },
  tipCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[400],
    ...Shadows.small,
  },
  tipTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
});