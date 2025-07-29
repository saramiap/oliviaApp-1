import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BreathingExerciseProps {
  title: string;
  description: string;
  params: {
    cycles: number;
    inspire: number;
    hold: number;
    expire: number;
    instructions: string[];
  };
  onComplete: () => void;
}

export default function BreathingExercise({ 
  title, 
  description, 
  params, 
  onComplete 
}: BreathingExerciseProps) {
  const { cycles, inspire, hold, expire, instructions } = params;
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'inspire' | 'hold' | 'expire' | 'finished'>('idle');
  const [countdown, setCountdown] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Animation pour le cercle de respiration
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(0.6);

  const startCycle = useCallback(() => {
    if (currentCycle < cycles) {
      setCurrentPhase('inspire');
      setCountdown(inspire);
    } else {
      setCurrentPhase('finished');
    }
  }, [currentCycle, cycles, inspire]);

  useEffect(() => {
    if (currentPhase === 'idle' || currentPhase === 'finished') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Fin d'une phase, passer à la suivante
      if (currentPhase === 'inspire') {
        setCurrentPhase('hold');
        setCountdown(hold);
      } else if (currentPhase === 'hold') {
        setCurrentPhase('expire');
        setCountdown(expire);
      } else if (currentPhase === 'expire') {
        setCurrentCycle(c => c + 1);
        if (currentCycle + 1 < cycles) {
          startCycle();
        } else {
          setCurrentPhase('finished');
        }
      }
    }
  }, [countdown, currentPhase, hold, expire, currentCycle, cycles, startCycle]);

  // Animation du cercle selon la phase
  useEffect(() => {
    if (currentPhase === 'inspire') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: inspire * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: inspire * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase === 'expire') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: expire * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: expire * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentPhase, inspire, expire]);

  const handleStart = () => {
    setShowInstructions(false);
    setCurrentCycle(0);
    startCycle();
  };

  const getPhaseText = () => {
    switch(currentPhase) {
      case 'inspire': return `Inspirez... (${countdown}s)`;
      case 'hold': return `Retenez... (${countdown}s)`;
      case 'expire': return `Expirez... (${countdown}s)`;
      case 'finished': return "Exercice terminé !";
      default: return "Prêt·e ?";
    }
  };

  const getPhaseColor = () => {
    switch(currentPhase) {
      case 'inspire': return '#4CAF50';
      case 'hold': return '#FF9800';
      case 'expire': return '#2196F3';
      case 'finished': return '#9C27B0';
      default: return '#8E8E93';
    }
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
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStart}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>
              Commencer l'exercice ({cycles} cycles)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.exercisePanel}>
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
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
        </View>
        
        {currentPhase !== 'finished' && (
          <Text style={styles.cycleCount}>
            Cycle : {currentCycle + 1} / {cycles}
          </Text>
        )}
        
        {currentPhase === 'finished' && (
          <View style={styles.finishedSection}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.finishedText}>Félicitations !</Text>
            <Text style={styles.finishedSubtext}>
              Vous avez terminé l'exercice de respiration
            </Text>
            
            <View style={styles.finishedActions}>
              <TouchableOpacity 
                style={styles.restartButton}
                onPress={handleStart}
              >
                <Ionicons name="refresh" size={20} color="#007AFF" />
                <Text style={styles.restartButtonText}>Recommencer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={onComplete}
              >
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
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
  instructionsPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
    minWidth: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisePanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  cycleCount: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  finishedSection: {
    alignItems: 'center',
    padding: 24,
  },
  finishedText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  finishedSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  finishedActions: {
    flexDirection: 'row',
    gap: 16,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  restartButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});