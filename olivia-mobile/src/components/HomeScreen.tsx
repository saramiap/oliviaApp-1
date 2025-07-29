import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Shadows, Animations } from '@/constants/Design';
import EnhancedOliviaAvatar from '@/components/EnhancedOliviaAvatar';

const { width } = Dimensions.get('window');

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
  delay?: number;
}

function FeatureCard({ icon, title, description, color, onPress, delay = 0 }: FeatureCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: Animations.timing.normal,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity style={styles.featureCardContent} onPress={onPress}>
        <LinearGradient
          colors={[color + '20', color + '10']}
          style={styles.featureCardGradient}
        >
          <View style={[styles.iconContainer, { backgroundColor: color + '30' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}

function QuickAction({ icon, label, onPress, color }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: Animations.timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeAnim, {
        toValue: 1,
        duration: Animations.timing.normal,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de respiration continue pour l'avatar
    const breathingAnimation = () => {
      Animated.sequence([
        Animated.timing(breathingScale, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => breathingAnimation());
    };
    
    setTimeout(() => breathingAnimation(), 1000);
  }, []);

  const features = [
    {
      icon: 'chatbubble-ellipses' as const,
      title: 'Chat avec Olivia',
      description: 'Parlez de vos émotions et recevez un soutien personnalisé',
      color: Colors.primary[500],
      onPress: () => router.push('/(tabs)/chat'),
    },
    {
      icon: 'leaf' as const,
      title: 'Exercices de détente',
      description: 'Respirations, méditations et voyages sonores apaisants',
      color: Colors.nature[500],
      onPress: () => router.push('/(tabs)/detente'),
    },
    {
      icon: 'book' as const,
      title: 'Journal personnel',
      description: 'Exprimez vos pensées et suivez votre évolution',
      color: Colors.warm[500],
      onPress: () => router.push('/(tabs)/journal'),
    },
    {
      icon: 'shield-checkmark' as const,
      title: 'Ressources d\'urgence',
      description: 'Accès rapide à une aide professionnelle 24/7',
      color: Colors.error,
      onPress: () => router.push('/urgence'),
    },
  ];

  const quickActions = [
    {
      icon: 'heart' as const,
      label: 'Respiration',
      color: Colors.nature[400],
      onPress: () => router.push('/respiration'),
    },
    {
      icon: 'musical-notes' as const,
      label: 'Voyage sonore',
      color: Colors.spiritual[400],
      onPress: () => router.push('/sound-journey'),
    },
    {
      icon: 'fitness' as const,
      label: 'Détente',
      color: Colors.warm[400],
      onPress: () => router.push('/detente'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header avec gradient */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <LinearGradient
            colors={[Colors.primary[400], Colors.nature[300]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <View style={styles.avatarContainer}>
                  <EnhancedOliviaAvatar
                    size="large"
                    showBreathing={true}
                    isSpeaking={false}
                    isThinking={false}
                  />
                </View>
                
                <View style={styles.welcomeText}>
                  <Text style={styles.greeting}>Bonjour</Text>
                  <Text style={styles.welcomeMessage}>
                    Comment vous sentez-vous aujourd'hui ?
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Actions rapides */}
        <Animated.View style={[styles.quickActionsSection, { opacity: welcomeAnim }]}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </View>
        </Animated.View>

        {/* Fonctionnalités principales */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Découvrez Olivia</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 100}
              />
            ))}
          </View>
        </View>

        {/* Citation inspirante */}
        <Animated.View style={[styles.quoteSection, { opacity: welcomeAnim }]}>
          <View style={styles.quoteCard}>
            <Ionicons name="flower" size={24} color={Colors.spiritual[400]} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "La sérénité n'est pas l'absence de tempête, mais la paix au milieu de la tempête."
            </Text>
            <Text style={styles.quoteAuthor}>— Pensée du jour</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerGradient: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.fontSize.title,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background.primary,
    marginBottom: Spacing.xs,
  },
  welcomeMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.background.primary + 'E0',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
  },
  quickActionsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  featuresSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  featuresGrid: {
    gap: Spacing.md,
  },
  featureCard: {
    marginBottom: Spacing.md,
  },
  featureCardContent: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  featureCardGradient: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  quoteSection: {
    paddingHorizontal: Spacing.lg,
  },
  quoteCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  quoteIcon: {
    marginBottom: Spacing.md,
  },
  quoteText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  quoteAuthor: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});