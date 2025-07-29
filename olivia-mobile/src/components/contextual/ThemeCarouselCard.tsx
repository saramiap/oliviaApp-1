import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoundJourneyTheme, formatDuration, getCategoryIcon } from '@/data/soundJourneyThemes';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Typography, Shadows } from '../../constants/Design';

interface ThemeCarouselCardProps {
  theme: SoundJourneyTheme;
  isSelected: boolean;
  onSelect: (theme: SoundJourneyTheme) => void;
}

export default function ThemeCarouselCard({ 
  theme, 
  isSelected, 
  onSelect 
}: ThemeCarouselCardProps) {
  // Convertir le chemin de l'image pour React Native
  const getImageSource = (imagePath: string) => {
    // Mappage des images pour React Native
    const imageMap: Record<string, any> = {
      '../assets/images/foret.jpg': require('../../../assets/images/foret.jpg'),
      '../assets/images/la-mer.jpg': require('../../../assets/images/la-mer.jpg'),
      '../assets/images/pluie-relaxante.jpg': require('../../../assets/images/pluie-relaxante.jpg'),
      '../assets/images/relaxation.jpg': require('../../../assets/images/relaxation.jpg'),
      '../assets/images/patoger-dans-leau.jpg': require('../../../assets/images/patoger-dans-leau.jpg'),
      '../assets/images/yoga.jpg': require('../../../assets/images/yoga.jpg'),
    };
    
    return imageMap[imagePath] || require('../../../assets/images/voyage-sonore.jpg');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onSelect(theme)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={getImageSource(theme.backgroundImage)}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        {/* Overlay gradient */}
        <View style={styles.overlay} />
        
        {/* Indicateur de sélection */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary[500]} />
          </View>
        )}
        
        {/* Icône de catégorie */}
        <View style={styles.categoryIcon}>
          <Ionicons 
            name={getCategoryIcon(theme.category) as any} 
            size={16} 
            color={Colors.text.inverse} 
          />
        </View>
        
        {/* Contenu de la carte */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {theme.title}
            </Text>
            <View style={styles.durationBadge}>
              <Ionicons name="time" size={12} color={Colors.text.inverse} />
              <Text style={styles.durationText}>
                {formatDuration(theme.duration)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {theme.description}
          </Text>
          
          {/* Tags */}
          <View style={styles.tags}>
            {theme.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 120,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.card,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: Colors.primary[500],
    ...Shadows.large,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: BorderRadius.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.overlay,
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  categoryIcon: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    marginRight: Spacing.xs,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 2,
  },
  durationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.medium,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.inverse,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.xs,
    opacity: 0.9,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    fontSize: Typography.fontSize.xs - 2,
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.medium,
  },
});