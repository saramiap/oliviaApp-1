import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Animations } from '@/constants/Design';

interface EnhancedOliviaAvatarProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  isSpeaking?: boolean;
  isThinking?: boolean;
  showBreathing?: boolean;
  style?: any;
}

export default function EnhancedOliviaAvatar({
  size = 'medium',
  isSpeaking = false,
  isThinking = false,
  showBreathing = true,
  style,
}: EnhancedOliviaAvatarProps) {
  // Animations
  const breathingScale = useRef(new Animated.Value(1)).current;
  const speakingScale = useRef(new Animated.Value(1)).current;
  const thinkingRotation = useRef(new Animated.Value(0)).current;
  const auraOpacity = useRef(new Animated.Value(0.3)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  // Tailles selon le prop size
  const getSizes = () => {
    switch (size) {
      case 'small':
        return { avatar: 32, text: 14, aura1: 40, aura2: 48, aura3: 56 };
      case 'medium':
        return { avatar: 48, text: 20, aura1: 60, aura2: 72, aura3: 84 };
      case 'large':
        return { avatar: 64, text: 28, aura1: 80, aura2: 96, aura3: 112 };
      case 'hero':
        return { avatar: 120, text: 48, aura1: 140, aura2: 160, aura3: 180 };
      default:
        return { avatar: 48, text: 20, aura1: 60, aura2: 72, aura3: 84 };
    }
  };

  const sizes = getSizes();

  // Animation de respiration continue
  useEffect(() => {
    if (showBreathing) {
      const breathingAnimation = () => {
        Animated.sequence([
          Animated.timing(breathingScale, {
            toValue: 1.08,
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
      breathingAnimation();
    }
  }, [showBreathing]);

  // Animation de parole
  useEffect(() => {
    if (isSpeaking) {
      const speakingAnimation = () => {
        Animated.sequence([
          Animated.timing(speakingScale, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(speakingScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isSpeaking) speakingAnimation();
        });
      };
      speakingAnimation();
    } else {
      Animated.timing(speakingScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isSpeaking]);

  // Animation de réflexion
  useEffect(() => {
    if (isThinking) {
      const thinkingAnimation = () => {
        Animated.sequence([
          Animated.timing(thinkingRotation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(thinkingRotation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isThinking) thinkingAnimation();
        });
      };
      thinkingAnimation();
    }
  }, [isThinking]);

  // Animation de l'aura
  useEffect(() => {
    const auraAnimation = () => {
      Animated.sequence([
        Animated.timing(auraOpacity, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(auraOpacity, {
          toValue: 0.2,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => auraAnimation());
    };
    auraAnimation();

    const glowAnimation = () => {
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => glowAnimation());
    };
    glowAnimation();
  }, []);

  const rotateInterpolate = thinkingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getAvatarColor = () => {
    if (isSpeaking) return Colors.olivia.speaking;
    if (isThinking) return Colors.olivia.calm;
    return Colors.olivia.breathing;
  };

  const getGradientColors = (): [string, string] => {
    if (isSpeaking) return [Colors.nature[300], Colors.nature[400]];
    if (isThinking) return [Colors.spiritual[300], Colors.spiritual[400]];
    return [Colors.primary[300], Colors.primary[400]];
  };

  return (
    <View style={[styles.container, style]}>
      {/* Auras extérieures */}
      <Animated.View
        style={[
          styles.auraCircle,
          {
            width: sizes.aura3,
            height: sizes.aura3,
            opacity: auraOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      >
        <LinearGradient
          colors={[getGradientColors()[0] + '20', 'transparent']}
          style={[styles.auraGradient, { borderRadius: sizes.aura3 / 2 }]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.auraCircle,
          {
            width: sizes.aura2,
            height: sizes.aura2,
            opacity: auraOpacity,
            transform: [{ scale: Animated.multiply(glowScale, 0.95) }],
          },
        ]}
      >
        <LinearGradient
          colors={[getGradientColors()[0] + '30', 'transparent']}
          style={[styles.auraGradient, { borderRadius: sizes.aura2 / 2 }]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.auraCircle,
          {
            width: sizes.aura1,
            height: sizes.aura1,
            opacity: auraOpacity,
            transform: [{ scale: Animated.multiply(glowScale, 0.9) }],
          },
        ]}
      >
        <LinearGradient
          colors={[getGradientColors()[0] + '40', 'transparent']}
          style={[styles.auraGradient, { borderRadius: sizes.aura1 / 2 }]}
        />
      </Animated.View>

      {/* Avatar principal */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: sizes.avatar,
            height: sizes.avatar,
            transform: [
              { scale: Animated.multiply(breathingScale, speakingScale) },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={[
            styles.avatarGradient,
            {
              width: sizes.avatar,
              height: sizes.avatar,
              borderRadius: sizes.avatar / 2,
            },
          ]}
        >
          <View
            style={[
              styles.avatarInner,
              {
                width: sizes.avatar - 4,
                height: sizes.avatar - 4,
                borderRadius: (sizes.avatar - 4) / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  fontSize: sizes.text,
                },
              ]}
            >
              O
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Indicateur d'état */}
      {(isSpeaking || isThinking) && (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isSpeaking
                  ? Colors.nature[400]
                  : Colors.spiritual[400],
              },
            ]}
          />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isSpeaking
                  ? Colors.nature[400]
                  : Colors.spiritual[400],
                opacity: 0.7,
              },
            ]}
          />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isSpeaking
                  ? Colors.nature[400]
                  : Colors.spiritual[400],
                opacity: 0.4,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  auraCircle: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
  },
  auraGradient: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarInner: {
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[600],
    textAlign: 'center',
  },
  statusContainer: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    gap: 2,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: BorderRadius.full,
  },
});