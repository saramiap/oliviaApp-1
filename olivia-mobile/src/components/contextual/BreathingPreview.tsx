import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  BreathingExercise, 
  getRecommendedExercises, 
  formatBreathingDuration,
  calculateCycleDuration,
  getCategoryColor
} from '../../data/breathingExercises';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Typography, Shadows } from '../../constants/Design';

interface BreathingPreviewProps {
  params?: { exerciseId?: string; duration?: number; cycles?: number };
  onAction: (actionName: string, params: any) => void;
}

export default function BreathingPreview({ 
  params, 
  onAction 
}: BreathingPreviewProps) {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(300); // 5 minutes par défaut
  const [selectedCycles, setSelectedCycles] = useState<number>(10);
  
  const availableExercises = getRecommendedExercises();
  const durationOptions = [180, 300, 600, 900]; // 3, 5, 10, 15 minutes
  const cycleOptions = [5, 10, 15, 20];

  // Si un exerciseId est fourni dans les params, sélectionner cet exercice
  React.useEffect(() => {
    if (params?.exerciseId) {
      const preselectedExercise = availableExercises.find(ex => ex.id === params.exerciseId);
      if (preselectedExercise) {
        setSelectedExercise(preselectedExercise);
        setSelectedDuration(params.duration || preselectedExercise.defaultDuration);
        setSelectedCycles(params.cycles || preselectedExercise.defaultCycles);
      }
    }
  }, [params?.exerciseId, availableExercises]);

  const handleExerciseSelect = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setSelectedDuration(exercise.defaultDuration);
    setSelectedCycles(exercise.defaultCycles);
  };

  const handlePreviewAction = () => {
    if (!selectedExercise) return;
    
    onAction('PREVIEW_BREATHING_PATTERN', {
      exerciseId: selectedExercise.id,
      duration: 30, // 30 secondes d'aperçu du pattern
      pattern: selectedExercise.pattern,
      title: selectedExercise.title
    });
  };

  const handleStartExerciseAction = () => {
    if (!selectedExercise) return;
    
    onAction('START_BREATHING_EXERCISE', {
      exerciseId: selectedExercise.id,
      duration: selectedDuration,
      cycles: selectedCycles,
      pattern: selectedExercise.pattern,
      title: selectedExercise.title
    });
  };

  const renderBreathingPattern = (exercise: BreathingExercise) => {
    const { pattern } = exercise;
    const cycleDuration = calculateCycleDuration(pattern);
    
    return (
      <View style={styles.patternContainer}>
        <Text style={styles.patternTitle}>Pattern de Respiration :</Text>
        <View style={styles.patternSteps}>
          <View style={styles.patternStep}>
            <View style={[styles.patternIcon, { backgroundColor: Colors.primary[100] }]}>
              <Ionicons name="arrow-down" size={16} color={Colors.primary[600]} />
            </View>
            <Text style={styles.patternText}>Inspirer : {pattern.inhale}s</Text>
          </View>
          
          {pattern.hold1 && (
            <View style={styles.patternStep}>
              <View style={[styles.patternIcon, { backgroundColor: Colors.warm[100] }]}>
                <Ionicons name="pause" size={16} color={Colors.warm[600]} />
              </View>
              <Text style={styles.patternText}>Retenir : {pattern.hold1}s</Text>
            </View>
          )}
          
          <View style={styles.patternStep}>
            <View style={[styles.patternIcon, { backgroundColor: Colors.nature[100] }]}>
              <Ionicons name="arrow-up" size={16} color={Colors.nature[600]} />
            </View>
            <Text style={styles.patternText}>Expirer : {pattern.exhale}s</Text>
          </View>
          
          {pattern.hold2 && (
            <View style={styles.patternStep}>
              <View style={[styles.patternIcon, { backgroundColor: Colors.spiritual[100] }]}>
                <Ionicons name="pause" size={16} color={Colors.spiritual[600]} />
              </View>
              <Text style={styles.patternText}>Pause : {pattern.hold2}s</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cycleInfo}>
          <Text style={styles.cycleInfoText}>
            Cycle complet : {cycleDuration}s • {Math.round(60 / cycleDuration)} cycles/min
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="leaf" size={24} color={Colors.primary[500]} />
          <Text style={styles.title}>Exercices de Respiration</Text>
        </View>
        <Text style={styles.subtitle}>
          Choisissez un exercice adapté à vos besoins du moment
        </Text>
      </View>

      {/* Sélection de l'exercice */}
      <View style={styles.exerciseSelection}>
        <Text style={styles.sectionLabel}>Exercices Recommandés</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.exerciseCarousel}
        >
          {availableExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                selectedExercise?.id === exercise.id && styles.selectedExerciseCard
              ]}
              onPress={() => handleExerciseSelect(exercise)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.exerciseIcon,
                { backgroundColor: getCategoryColor(exercise.category) + '20' }
              ]}>
                <Ionicons 
                  name={exercise.icon as any} 
                  size={20} 
                  color={getCategoryColor(exercise.category)} 
                />
              </View>
              <Text style={styles.exerciseTitle} numberOfLines={2}>
                {exercise.title}
              </Text>
              <Text style={styles.exerciseCategory}>
                {exercise.category}
              </Text>
              <Text style={styles.exerciseDuration}>
                {formatBreathingDuration(exercise.defaultDuration)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Détails de l'exercice sélectionné */}
      {selectedExercise && (
        <View style={styles.selectedExerciseDetails}>
          <Text style={styles.selectedExerciseTitle}>{selectedExercise.title}</Text>
          <Text style={styles.selectedExerciseDescription}>
            {selectedExercise.description}
          </Text>
          
          {/* Pattern de respiration */}
          {renderBreathingPattern(selectedExercise)}
          
          {/* Bénéfices */}
          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Bénéfices :</Text>
            <View style={styles.benefitsList}>
              {selectedExercise.benefits.slice(0, 2).map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.nature[500]} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Options de durée et cycles */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Durée :</Text>
              <View style={styles.optionButtons}>
                {durationOptions.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.optionButton,
                      selectedDuration === duration && styles.selectedOptionButton
                    ]}
                    onPress={() => setSelectedDuration(duration)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedDuration === duration && styles.selectedOptionButtonText
                    ]}>
                      {formatBreathingDuration(duration)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Cycles :</Text>
              <View style={styles.optionButtons}>
                {cycleOptions.map((cycles) => (
                  <TouchableOpacity
                    key={cycles}
                    style={[
                      styles.optionButton,
                      selectedCycles === cycles && styles.selectedOptionButton
                    ]}
                    onPress={() => setSelectedCycles(cycles)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedCycles === cycles && styles.selectedOptionButtonText
                    ]}>
                      {cycles}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.previewButton,
            !selectedExercise && styles.disabledButton
          ]}
          onPress={handlePreviewAction}
          disabled={!selectedExercise}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="play-circle" 
            size={20} 
            color={selectedExercise ? Colors.primary[600] : Colors.text.tertiary} 
          />
          <Text style={[
            styles.actionButtonText,
            styles.previewButtonText,
            !selectedExercise && styles.disabledButtonText
          ]}>
            Aperçu du Rythme
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.startButton,
            !selectedExercise && styles.disabledButton
          ]}
          onPress={handleStartExerciseAction}
          disabled={!selectedExercise}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="play" 
            size={20} 
            color={selectedExercise ? Colors.text.inverse : Colors.text.tertiary} 
          />
          <Text style={[
            styles.actionButtonText,
            styles.startButtonText,
            !selectedExercise && styles.disabledButtonText
          ]}>
            Commencer l'Exercice
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.sm,
    ...Shadows.card,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  // Sélection d'exercice
  exerciseSelection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  exerciseCarousel: {
    paddingHorizontal: Spacing.xs,
  },
  exerciseCard: {
    width: 120,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selectedExerciseCard: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
    ...Shadows.medium,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  exerciseCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  exerciseDuration: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  
  // Détails de l'exercice sélectionné
  selectedExerciseDetails: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  selectedExerciseTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  selectedExerciseDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  // Pattern de respiration
  patternContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  patternTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  patternSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  patternStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: '45%',
  },
  patternIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  cycleInfo: {
    marginTop: Spacing.sm,
    padding: Spacing.xs,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.xs,
  },
  cycleInfoText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  
  // Bénéfices
  benefits: {
    marginTop: Spacing.sm,
  },
  benefitsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  benefitsList: {
    gap: Spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  benefitText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  
  // Options
  optionsContainer: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  optionGroup: {
    gap: Spacing.xs,
  },
  optionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  selectedOptionButton: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  optionButtonText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  selectedOptionButtonText: {
    color: Colors.primary[600],
  },
  
  // Boutons d'action
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  previewButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  startButton: {
    backgroundColor: Colors.primary[500],
  },
  disabledButton: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.light,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  previewButtonText: {
    color: Colors.primary[600],
  },
  startButtonText: {
    color: Colors.text.inverse,
  },
  disabledButtonText: {
    color: Colors.text.tertiary,
  },
});