import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Animations } from '@/constants/Design';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Séquence d'animations
    const startAnimations = () => {
      // 1. Fade in du background
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: Animations.timing.slow,
        useNativeDriver: true,
      }).start();

      // 2. Apparition du logo avec scale et fade
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: Animations.timing.slow * 1.2,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: Animations.timing.slow,
          useNativeDriver: true,
        }),
      ]).start();

      // 3. Apparition du titre après 300ms
      setTimeout(() => {
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: Animations.timing.normal,
          useNativeDriver: true,
        }).start();
      }, 300);

      // 4. Apparition du sous-titre après 600ms
      setTimeout(() => {
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: Animations.timing.normal,
          useNativeDriver: true,
        }).start();
      }, 600);

      // 5. Animation de respiration continue
      setTimeout(() => {
        startBreathingAnimation();
      }, 800);

      // 6. Fin de la splash screen après 2.5 secondes
      setTimeout(() => {
        onFinish();
      }, 2500);
    };

    const startBreathingAnimation = () => {
      const breathingSequence = () => {
        Animated.sequence([
          Animated.timing(breathingScale, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          breathingSequence(); // Répéter l'animation
        });
      };
      breathingSequence();
    };

    startAnimations();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background gradient animé */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
        <LinearGradient
          colors={[Colors.primary[400], Colors.nature[300], Colors.spiritual[300]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Logo Olivia avec animation de respiration */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: Animated.multiply(logoScale, breathingScale) },
              ],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>O</Text>
          </View>
          
          {/* Cercles d'aura autour du logo */}
          <Animated.View style={[styles.auraCircle, styles.auraCircle1, { opacity: logoOpacity }]} />
          <Animated.View style={[styles.auraCircle, styles.auraCircle2, { opacity: logoOpacity }]} />
          <Animated.View style={[styles.auraCircle, styles.auraCircle3, { opacity: logoOpacity }]} />
        </Animated.View>

        {/* Titre */}
        <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
          <Text style={styles.title}>Olivia</Text>
          <Text style={styles.subtitle}>Sérenis</Text>
        </Animated.View>

        {/* Sous-titre */}
        <Animated.View style={[styles.descriptionContainer, { opacity: subtitleOpacity }]}>
          <Text style={styles.description}>Votre compagnon de bien-être</Text>
          <Text style={styles.tagline}>Respirez • Ressentez • Renaissez</Text>
        </Animated.View>
      </View>

      {/* Indicateur de chargement subtil */}
      <Animated.View style={[styles.loadingContainer, { opacity: subtitleOpacity }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow.large,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[500],
    textAlign: 'center',
  },
  auraCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
  },
  auraCircle1: {
    width: 140,
    height: 140,
    borderColor: Colors.background.primary + '40',
  },
  auraCircle2: {
    width: 160,
    height: 160,
    borderColor: Colors.background.primary + '25',
  },
  auraCircle3: {
    width: 180,
    height: 180,
    borderColor: Colors.background.primary + '15',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background.primary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.light,
    color: Colors.background.primary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    letterSpacing: 1.5,
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  description: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.background.primary,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.light,
    color: Colors.background.primary,
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    marginHorizontal: Spacing.xs,
    opacity: 0.6,
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.4,
  },
});