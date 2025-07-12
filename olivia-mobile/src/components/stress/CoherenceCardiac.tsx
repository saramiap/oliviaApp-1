import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CoherenceCardiacProps {
  title: string;
  description: string;
  params: {
    duration: number; // en secondes
    breathsPerMinute?: number;
  };
  onComplete: () => void;
}

export default function CoherenceCardiac({ 
  title, 
  description, 
  params, 
  onComplete 
}: CoherenceCardiacProps) {
  const { duration, breathsPerMinute = 6 } = params;
  
  const cycleDuration = 60 / breathsPerMinute; // Durée d'un cycle complet en secondes
  const phaseDuration = cycleDuration / 2; // Durée d'une phase (inspire OU expire)

  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inspire' | 'expire' | 'finished'>('inspire');
  const [showInstructions, setShowInstructions] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation pour la forme de cohérence cardiaque
  const scaleAnim = new Animated.Value(1);
  const colorAnim = new Animated.Value(0);

  const resetExercise = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
    setCurrentPhase('inspire');
    setShowInstructions(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
  }, [duration]);

  // Gère le décompte principal de l'exercice
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setCurrentPhase('finished');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Gère l'alternance des phases inspire/expire
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      setCurrentPhase('inspire');
      phaseTimerRef.current = setInterval(() => {
        setCurrentPhase(prevPhase => prevPhase === 'inspire' ? 'expire' : 'inspire');
      }, phaseDuration * 1000);
    } else {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      if (timeLeft === 0) setCurrentPhase('finished');
    }
    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, [isRunning, timeLeft, phaseDuration]);

  // Animation selon la phase
  useEffect(() => {
    if (currentPhase === 'inspire') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: phaseDuration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: phaseDuration * 1000,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (currentPhase === 'expire') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: phaseDuration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: phaseDuration * 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [currentPhase, phaseDuration]);

  const handleStartPause = () => {
    if (showInstructions) setShowInstructions(false);
    if (timeLeft === 0) {
      resetExercise();
      return;
    }
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getPhaseText = () => {
    if (currentPhase === 'finished') return "Terminé !";
    if (!isRunning) return "En pause";
    return currentPhase === 'inspire' ? "Inspirez" : "Expirez";
  };

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2196F3', '#4CAF50'],
  });

  if (showInstructions) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.instructionsPanel}>
          <Text style={styles.instructionsTitle}>Instructions :</Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Installez-vous confortablement, le dos droit mais détendu
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Respirez calmement par le nez
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Synchronisez votre respiration avec le guide visuel
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Objectif : {breathsPerMinute} respirations par minute
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartPause}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>
              Commencer ({formatTime(duration)})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.exercisePanel}>
        <View style={styles.coherenceVisualizer}>
          <Animated.View 
            style={[
              styles.coherenceShape,
              {
                backgroundColor,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          />
          <Text style={styles.phaseLabel}>{getPhaseText()}</Text>
        </View>

        <Text style={styles.timerDisplay}>
          Temps restant : {formatTime(timeLeft)}
        </Text>
        
        {currentPhase === 'finished' ? (
          <View style={styles.finishedSection}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.finishedText}>Excellente séance !</Text>
            <Text style={styles.finishedSubtext}>
              Vous avez pratiqué {Math.floor(duration / 60)} minutes de cohérence cardiaque
            </Text>
            
            <View style={styles.finishedActions}>
              <TouchableOpacity 
                style={styles.restartButton}
                onPress={resetExercise}
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
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleStartPause}
            >
              <Ionicons 
                name={isRunning ? "pause" : "play"} 
                size={24} 
                color="#007AFF" 
              />
              <Text style={styles.controlButtonText}>
                {isRunning ? "Pause" : "Reprendre"}
              </Text>
            </TouchableOpacity>
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
    backgroundColor: '#2196F3',
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
  coherenceVisualizer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  coherenceShape: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
  },
  phaseLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  timerDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 24,
  },
  controls: {
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
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