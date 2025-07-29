import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GroundingStep {
  sense: string;
  instruction: string;
  count: number;
}

interface Grounding54321Props {
  title: string;
  description: string;
  params: {
    steps: GroundingStep[];
  };
  onComplete: () => void;
}

const SenseIcon = ({ sense }: { sense: string }) => {
  switch (sense.toUpperCase()) {
    case 'VOIR': return <Ionicons name="eye" size={28} color="#007AFF" />;
    case 'TOUCHER': return <Ionicons name="hand-left" size={28} color="#007AFF" />;
    case 'ENTENDRE': return <Ionicons name="ear" size={28} color="#007AFF" />;
    case 'SENTIR (ODORAT)': return <Ionicons name="flower" size={28} color="#007AFF" />;
    case 'GOÛTER': return <Ionicons name="restaurant" size={28} color="#007AFF" />;
    default: return <Ionicons name="radio-button-on" size={28} color="#007AFF" />;
  }
};

export default function Grounding54321({ 
  title, 
  description, 
  params, 
  onComplete 
}: Grounding54321Props) {
  const { steps } = params;
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);

  const currentStepData = steps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
      setIsStepCompleted(false);
    } else {
      // Toutes les étapes sont terminées
      onComplete();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
      setIsStepCompleted(false);
    }
  };

  if (!currentStepData) {
    return (
      <View style={styles.container}>
        <View style={styles.finishedSection}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          <Text style={styles.finishedTitle}>Excellent !</Text>
          <Text style={styles.finishedText}>
            Vous avez complété l'exercice d'ancrage 5-4-3-2-1.
          </Text>
          <Text style={styles.finishedSubtext}>
            Prenez un instant pour remarquer comment vous vous sentez.
          </Text>
          
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={onComplete}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Terminer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepIcon}>
            <SenseIcon sense={currentStepData.sense} />
          </View>
          <Text style={styles.stepSenseTitle}>
            {currentStepData.count} Chose(s) à {currentStepData.sense.toLowerCase()}
          </Text>
        </View>
        
        <Text style={styles.stepInstruction}>{currentStepData.instruction}</Text>
        
        <View style={styles.stepProgress}>
          <Text style={styles.stepProgressText}>
            Étape {currentStepIndex + 1} sur {steps.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStepIndex + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {!isStepCompleted ? (
          <TouchableOpacity 
            style={styles.stepDoneButton} 
            onPress={() => setIsStepCompleted(true)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.stepDoneButtonText}>
              J'ai identifié les {currentStepData.count} élément(s)
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepConfirmation}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.confirmationText}>
              Bien ! {currentStepIndex < steps.length - 1 ? 'Passons à la suite.' : 'Exercice terminé !'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStepIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePreviousStep}
          disabled={currentStepIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentStepIndex === 0 ? "#8E8E93" : "#007AFF"} 
          />
          <Text style={[
            styles.navButtonText, 
            currentStepIndex === 0 && styles.navButtonTextDisabled
          ]}>
            Précédent
          </Text>
        </TouchableOpacity>
        
        <View style={styles.stepIndicator}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index <= currentStepIndex && styles.stepDotActive,
                index < currentStepIndex && styles.stepDotCompleted
              ]}
            />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.navButton, !isStepCompleted && styles.navButtonDisabled]}
          onPress={handleNextStep}
          disabled={!isStepCompleted}
        >
          <Text style={[
            styles.navButtonText, 
            !isStepCompleted && styles.navButtonTextDisabled
          ]}>
            {currentStepIndex >= steps.length - 1 ? 'Terminer' : 'Suivant'}
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={!isStepCompleted ? "#8E8E93" : "#007AFF"} 
          />
        </TouchableOpacity>
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
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIcon: {
    marginRight: 12,
  },
  stepSenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  stepInstruction: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
    marginBottom: 20,
  },
  stepProgress: {
    marginBottom: 20,
  },
  stepProgressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  stepDoneButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  stepDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
  },
  stepDotActive: {
    backgroundColor: '#007AFF',
  },
  stepDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  finishedSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  finishedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  finishedText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  finishedSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
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