import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/Design';

interface EnhancedBreathingExerciseProps {
  title: string;
  description: string;
  type: 'breathing-478' | 'box-breathing' | 'deep-breathing' | 'alternate-breathing' | 'emergency-breathing';
  params: {
    cycles: number;
    inspire: number;
    hold: number;
    expire: number;
    holdEmpty?: number; // Pour la respiration carrée
    instructions: string[];
  };
  onComplete: () => void;
}

export default function EnhancedBreathingExercise({ 
  title, 
  description, 
  type,
  params, 
  onComplete 
}: EnhancedBreathingExerciseProps) {
  const { cycles, inspire, hold, expire, holdEmpty, instructions } = params;
  
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'inspire' | 'hold' | 'expire' | 'holdEmpty' | 'finished' | 'paused'>('idle');
  const [countdown, setCountdown] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentNostril, setCurrentNostril] = useState<'left' | 'right'>('left'); // Pour respiration alternée
  const [isPaused, setIsPaused] = useState(false);
  const [savedPhase, setSavedPhase] = useState<'inspire' | 'hold' | 'expire' | 'holdEmpty'>('inspire');
  const [savedCountdown, setSavedCountdown] = useState(0);
  
  // Animations
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(0.6);
  const rotateAnim = new Animated.Value(0);

  const getPhaseSequence = () => {
    switch (type) {
      case 'box-breathing':
        return ['inspire', 'hold', 'expire', 'holdEmpty'];
      case 'breathing-478':
      case 'deep-breathing':
      case 'emergency-breathing':
        return ['inspire', 'hold', 'expire'];
      case 'alternate-breathing':
        return ['inspire', 'hold', 'expire'];
      default:
        return ['inspire', 'hold', 'expire'];
    }
  };

  const getPhaseColor = () => {
    switch(currentPhase) {
      case 'inspire': return Colors.nature[500];
      case 'hold': return Colors.warm[500];
      case 'expire': return Colors.primary[500];
      case 'holdEmpty': return Colors.spiritual[500];
      case 'finished': return Colors.success;
      default: return Colors.text.secondary;
    }
  };

  const getPhaseIcon = () => {
    switch(currentPhase) {
      case 'inspire': return 'arrow-up-circle';
      case 'hold': return 'pause-circle';
      case 'expire': return 'arrow-down-circle';
      case 'holdEmpty': return 'radio-button-off';
      case 'finished': return 'checkmark-circle';
      default: return 'radio-button-off';
    }
  };

  const getPhaseDuration = (phase: string) => {
    switch(phase) {
      case 'inspire': return inspire;
      case 'hold': return hold;
      case 'expire': return expire;
      case 'holdEmpty': return holdEmpty || 4;
      default: return 4;
    }
  };

  const getPhaseText = () => {
    if (currentPhase === 'finished') return "Exercice terminé !";
    if (currentPhase === 'paused' || isPaused) return "En pause";
    
    if (type === 'alternate-breathing') {
      const nostrilText = currentNostril === 'left' ? 'gauche' : 'droite';
      const oppositeNostril = currentNostril === 'left' ? 'droite' : 'gauche';
      switch(currentPhase) {
        case 'inspire': return `Inspirez narine ${nostrilText} (${countdown}s)`;
        case 'hold': return `Retenez... (${countdown}s)`;
        case 'expire': return `Expirez narine ${oppositeNostril} (${countdown}s)`;
        default: return "Prêt·e ?";
      }
    }
    
    switch(currentPhase) {
      case 'inspire': return `Inspirez... (${countdown}s)`;
      case 'hold': return `Retenez... (${countdown}s)`;
      case 'expire': return `Expirez... (${countdown}s)`;
      case 'holdEmpty': return `Poumons vides... (${countdown}s)`;
      default: return "Prêt·e ?";
    }
  };

  const handlePause = () => {
    if (isPaused) {
      // Reprendre
      setIsPaused(false);
      setCurrentPhase(savedPhase);
      setCountdown(savedCountdown);
    } else {
      // Pause
      setIsPaused(true);
      setSavedPhase(currentPhase as any);
      setSavedCountdown(countdown);
      setCurrentPhase('paused');
    }
  };

  const handleStop = () => {
    setCurrentPhase('idle');
    setCurrentCycle(0);
    setCountdown(0);
    setIsPaused(false);
    setShowInstructions(true);
    setCurrentNostril('left');
  };

  const startCycle = useCallback(() => {
    if (currentCycle < cycles) {
      const sequence = getPhaseSequence();
      setCurrentPhase(sequence[0] as any);
      setCountdown(getPhaseDuration(sequence[0]));
    } else {
      setCurrentPhase('finished');
    }
  }, [currentCycle, cycles, type]);

  useEffect(() => {
    if (currentPhase === 'idle' || currentPhase === 'finished' || currentPhase === 'paused' || isPaused) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Fin d'une phase, passer à la suivante
      const sequence = getPhaseSequence();
      const currentIndex = sequence.indexOf(currentPhase);
      
      if (currentIndex < sequence.length - 1) {
        // Phase suivante dans le cycle
        const nextPhase = sequence[currentIndex + 1];
        setCurrentPhase(nextPhase as any);
        setCountdown(getPhaseDuration(nextPhase));
        
        // Pour la respiration alternée, changer de narine à chaque cycle complet
        if (type === 'alternate-breathing' && nextPhase === 'inspire' && currentIndex === sequence.length - 1) {
          setCurrentNostril(prev => prev === 'left' ? 'right' : 'left');
        }
      } else {
        // Fin du cycle
        setCurrentCycle(c => c + 1);
        if (currentCycle + 1 < cycles) {
          startCycle();
        } else {
          setCurrentPhase('finished');
          // Vibration de fin
          Vibration.vibrate([200, 100, 200]);
        }
      }
    }
  }, [countdown, currentPhase, currentCycle, cycles, startCycle, type, isPaused]);

  // Animation du cercle selon la phase
  useEffect(() => {
    const duration = countdown * 1000;
    
    if (currentPhase === 'inspire') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: type === 'deep-breathing' ? 1.8 : 1.5,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase === 'expire') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase === 'hold') {
      // Animation de pulsation douce pendant la rétention
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.6,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.4,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    
    // Animation spéciale pour la respiration alternée
    if (type === 'alternate-breathing') {
      Animated.timing(rotateAnim, {
        toValue: currentNostril === 'left' ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentPhase, countdown, type, currentNostril]);

  const handleStart = () => {
    setShowInstructions(false);
    setCurrentCycle(0);
    setCurrentNostril('left');
    startCycle();
  };

  const renderVisualization = () => {
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    if (type === 'alternate-breathing') {
      return (
        <View style={styles.visualizer}>
          <Animated.View 
            style={[
              styles.nostrilContainer,
              { transform: [{ rotate: rotation }] }
            ]}
          >
            <View style={[styles.nostril, styles.leftNostril, 
              currentNostril === 'left' && currentPhase === 'inspire' ? 
              { backgroundColor: getPhaseColor() } : {}
            ]}>
              <Text style={styles.nostrilText}>G</Text>
            </View>
            <View style={[styles.nostril, styles.rightNostril,
              currentNostril === 'right' && currentPhase === 'inspire' ? 
              { backgroundColor: getPhaseColor() } : {}
            ]}>
              <Text style={styles.nostrilText}>D</Text>
            </View>
          </Animated.View>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
        </View>
      );
    }

    if (type === 'box-breathing') {
      return (
        <View style={styles.visualizer}>
          <Animated.View 
            style={[
              styles.boxBreathing,
              {
                backgroundColor: getPhaseColor(),
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              }
            ]}
          />
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
        </View>
      );
    }

    // Cercle classique pour les autres types
    return (
      <View style={styles.visualizer}>
        <Animated.View 
          style={[
            styles.breathingCircle,
            {
              backgroundColor: getPhaseColor(),
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        />
        <Ionicons 
          name={getPhaseIcon() as any} 
          size={32} 
          color={getPhaseColor()} 
          style={styles.phaseIcon} 
        />
        <Text style={styles.phaseText}>{getPhaseText()}</Text>
      </View>
    );
  };

  if (showInstructions) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.instructionsPanel}>
          <Text style={styles.instructionsTitle}>Instructions :</Text>
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}.</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
          
          <View style={styles.exerciseDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="refresh" size={16} color={Colors.primary[500]} />
              <Text style={styles.detailText}>{cycles} cycles</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color={Colors.primary[500]} />
              <Text style={styles.detailText}>
                {Math.ceil((inspire + hold + expire + (holdEmpty || 0)) * cycles / 60)} min
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStart}
          >
            <Ionicons name="play" size={20} color={Colors.background.primary} />
            <Text style={styles.startButtonText}>Commencer l'exercice</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.exercisePanel}>
        {renderVisualization()}
        
        {currentPhase !== 'finished' && (
          <View style={styles.exerciseInfo}>
            <Text style={styles.cycleCount}>
              Cycle : {currentCycle + 1} / {cycles}
            </Text>
            
            {/* Contrôles pause/arrêt */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={handlePause}
              >
                <Ionicons
                  name={isPaused ? "play" : "pause"}
                  size={20}
                  color={Colors.primary[500]}
                />
                <Text style={styles.pauseButtonText}>
                  {isPaused ? "Reprendre" : "Pause"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStop}
              >
                <Ionicons name="stop" size={20} color={Colors.error} />
                <Text style={styles.stopButtonText}>Arrêter</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {currentPhase === 'finished' && (
          <View style={styles.finishedSection}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            <Text style={styles.finishedText}>Félicitations !</Text>
            <Text style={styles.finishedSubtext}>
              Vous avez terminé l'exercice de {title.toLowerCase()}
            </Text>
            
            <View style={styles.finishedActions}>
              <TouchableOpacity 
                style={styles.restartButton}
                onPress={handleStart}
              >
                <Ionicons name="refresh" size={20} color={Colors.primary[500]} />
                <Text style={styles.restartButtonText}>Recommencer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={onComplete}
              >
                <Ionicons name="checkmark" size={20} color={Colors.background.primary} />
                <Text style={styles.completeButtonText}>Terminer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
  },
  instructionsPanel: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.card,
  },
  instructionsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary[500],
    marginRight: Spacing.sm,
    minWidth: 20,
  },
  instructionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  startButton: {
    backgroundColor: Colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  startButtonText: {
    color: Colors.background.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  exercisePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.xl,
  },
  boxBreathing: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  nostrilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  nostril: {
    width: 50,
    height: 80,
    borderRadius: 25,
    backgroundColor: Colors.background.tertiary,
    margin: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border.medium,
  },
  leftNostril: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rightNostril: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  nostrilText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  phaseIcon: {
    position: 'absolute',
  },
  phaseText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  cycleCount: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  finishedSection: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  finishedText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  finishedSubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
  },
  finishedActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  restartButtonText: {
    color: Colors.primary[500],
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  completeButtonText: {
    color: Colors.background.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    gap: Spacing.xs,
  },
  pauseButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.medium,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: Spacing.xs,
  },
  stopButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    fontWeight: Typography.fontWeight.medium,
  },
});