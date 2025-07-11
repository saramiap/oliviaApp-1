import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuoteDisplayProps {
  title: string;
  description: string;
  params: {
    quote: string;
    author?: string;
  };
  onComplete: () => void;
}

export default function QuoteDisplay({ 
  title, 
  description, 
  params, 
  onComplete 
}: QuoteDisplayProps) {
  const { quote, author } = params;
  const [showReflection, setShowReflection] = useState(false);
  
  // Animation pour l'apparition progressive de la citation
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-complétion après 30 secondes si l'utilisateur ne fait rien
    const autoTimer = setTimeout(() => {
      if (!showReflection) {
        setShowReflection(true);
      }
    }, 30000);

    return () => clearTimeout(autoTimer);
  }, []);

  const handleReflect = () => {
    setShowReflection(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <Animated.View 
        style={[
          styles.quoteContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.quoteIcon}>
          <Ionicons name="chatbox-ellipses" size={48} color="#9C27B0" />
        </View>
        
        <Text style={styles.quoteText}>"{quote}"</Text>
        
        {author && (
          <Text style={styles.quoteAuthor}>— {author}</Text>
        )}
      </Animated.View>

      {!showReflection ? (
        <View style={styles.reflectionPrompt}>
          <Text style={styles.reflectionPromptText}>
            Prenez un moment pour réfléchir à cette pensée...
          </Text>
          
          <TouchableOpacity 
            style={styles.reflectButton}
            onPress={handleReflect}
          >
            <Ionicons name="heart" size={20} color="#FFFFFF" />
            <Text style={styles.reflectButtonText}>
              J'ai pris un moment pour réfléchir
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.completedSection}>
          <Ionicons name="sparkles" size={32} color="#9C27B0" />
          <Text style={styles.completedTitle}>Merci d'avoir pris ce temps</Text>
          <Text style={styles.completedText}>
            Ces moments de réflexion sont précieux pour votre bien-être mental.
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.shareThoughtsButton}
              onPress={() => {/* Ouvrir une note rapide */}}
            >
              <Ionicons name="create-outline" size={20} color="#9C27B0" />
              <Text style={styles.shareThoughtsButtonText}>Noter mes pensées</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={onComplete}
            >
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Barre de progression subtile pour indiquer le temps passé */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          💫 Moment de réflexion en cours...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
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
    marginBottom: 32,
    lineHeight: 22,
  },
  quoteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  quoteIcon: {
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 16,
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '600',
  },
  reflectionPrompt: {
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  reflectionPromptText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  reflectButton: {
    backgroundColor: '#9C27B0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  reflectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedSection: {
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9C27B0',
    marginTop: 12,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareThoughtsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#9C27B0',
    borderRadius: 8,
    gap: 6,
  },
  shareThoughtsButtonText: {
    color: '#9C27B0',
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    gap: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});