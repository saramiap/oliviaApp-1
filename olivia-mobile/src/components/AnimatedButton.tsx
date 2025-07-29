import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Animations } from '@/constants/Design';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  gradientColors?: [string, string];
}

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  gradientColors,
}: AnimatedButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;

  // Animation de rotation pour le loading
  React.useEffect(() => {
    if (loading) {
      const rotateAnimation = () => {
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          loadingRotation.setValue(0);
          if (loading) rotateAnimation();
        });
      };
      rotateAnimation();
    }
  }, [loading]);

  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: Animations.timing.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: Animations.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(rippleAnim, {
        toValue: 0,
        duration: Animations.timing.normal,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animations.timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled || loading) return;
    
    // Animation de feedback tactile
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    onPress();
  };

  const getButtonColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return gradientColors || [Colors.primary[400], Colors.primary[600]];
      case 'secondary':
        return [Colors.nature[400], Colors.nature[600]];
      case 'outline':
        return ['transparent', 'transparent'];
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return [Colors.primary[400], Colors.primary[600]];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return Colors.background.primary;
      case 'outline':
        return Colors.primary[500];
      case 'ghost':
        return Colors.text.primary;
      default:
        return Colors.background.primary;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { height: 36, paddingHorizontal: Spacing.md, fontSize: Typography.fontSize.sm };
      case 'medium':
        return { height: 44, paddingHorizontal: Spacing.lg, fontSize: Typography.fontSize.md };
      case 'large':
        return { height: 52, paddingHorizontal: Spacing.xl, fontSize: Typography.fontSize.lg };
      default:
        return { height: 44, paddingHorizontal: Spacing.lg, fontSize: Typography.fontSize.md };
    }
  };

  const buttonSize = getButtonSize();
  const buttonColors = getButtonColors();
  const textColor = getTextColor();

  const rotateInterpolate = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const ButtonContent = () => (
    <>
      {/* Effet de ripple */}
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: rippleScale }],
            opacity: rippleAnim,
          },
        ]}
      />
      
      {/* Contenu du bouton */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        {loading ? (
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Ionicons 
              name="refresh" 
              size={buttonSize.fontSize} 
              color={textColor} 
            />
          </Animated.View>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons 
                name={icon} 
                size={buttonSize.fontSize} 
                color={textColor} 
                style={styles.iconLeft} 
              />
            )}
            <Text style={[styles.buttonText, { fontSize: buttonSize.fontSize, color: textColor }]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons 
                name={icon} 
                size={buttonSize.fontSize} 
                color={textColor} 
                style={styles.iconRight} 
              />
            )}
          </>
        )}
      </Animated.View>
    </>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: buttonSize.height,
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, { paddingHorizontal: buttonSize.paddingHorizontal }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {variant === 'primary' || variant === 'secondary' ? (
          <LinearGradient
            colors={buttonColors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ButtonContent />
          </LinearGradient>
        ) : (
          <Animated.View
            style={[
              styles.solidButton,
              {
                backgroundColor: variant === 'outline' ? 'transparent' : Colors.background.tertiary,
                borderWidth: variant === 'outline' ? 1 : 0,
                borderColor: variant === 'outline' ? Colors.primary[500] : 'transparent',
              },
            ]}
          >
            <ButtonContent />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  button: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  solidButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background.primary + '20',
    borderRadius: BorderRadius.lg,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});