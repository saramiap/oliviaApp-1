import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoundJourneyTheme, getRecommendedThemes, formatDuration } from '../../data/soundJourneyThemes';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Typography, Shadows } from '../../constants/Design';
import ThemeCarouselCard from './ThemeCarouselCard';

interface SoundJourneyPreviewProps {
  params?: { themeId?: string };
  onAction: (actionName: string, params: any) => void;
}

export default function SoundJourneyPreview({ 
  params, 
  onAction 
}: SoundJourneyPreviewProps) {
  const [selectedTheme, setSelectedTheme] = useState<SoundJourneyTheme | null>(null);
  const availableThemes = getRecommendedThemes(); // Les 3 premiers thèmes
  
  // Si un themeId est fourni dans les params, sélectionner ce thème
  React.useEffect(() => {
    if (params?.themeId) {
      const preselectedTheme = availableThemes.find(theme => theme.id === params.themeId);
      if (preselectedTheme) {
        setSelectedTheme(preselectedTheme);
      }
    }
  }, [params?.themeId, availableThemes]);

  const handleThemeSelect = (theme: SoundJourneyTheme) => {
    setSelectedTheme(theme);
  };

  const handlePreviewAction = () => {
    if (!selectedTheme) return;
    
    onAction('QUICK_PLAY_SOUND_JOURNEY', {
      themeId: selectedTheme.id,
      duration: 30, // 30 secondes d'aperçu
      title: selectedTheme.title
    });
  };

  const handleFullImmersionAction = () => {
    if (!selectedTheme) return;
    
    onAction('NAVIGATE_FULL_SOUND_JOURNEY', {
      themeId: selectedTheme.id,
      duration: selectedTheme.duration,
      title: selectedTheme.title
    });
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="musical-notes" size={24} color={Colors.primary[500]} />
          <Text style={styles.title}>Voyages Sonores Disponibles</Text>
        </View>
        <Text style={styles.subtitle}>
          Choisissez votre environnement sonore pour une expérience immersive
        </Text>
      </View>

      {/* Carousel des thèmes */}
      <View style={styles.carouselSection}>
        <Text style={styles.carouselLabel}>Thèmes Recommandés</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          style={styles.carousel}
        >
          {availableThemes.map((theme) => (
            <ThemeCarouselCard
              key={theme.id}
              theme={theme}
              isSelected={selectedTheme?.id === theme.id}
              onSelect={handleThemeSelect}
            />
          ))}
        </ScrollView>
      </View>

      {/* Informations du thème sélectionné */}
      {selectedTheme && (
        <View style={styles.selectedThemeInfo}>
          <View style={styles.themeDetails}>
            <Text style={styles.selectedThemeTitle}>{selectedTheme.title}</Text>
            <Text style={styles.selectedThemeDescription}>
              {selectedTheme.description}
            </Text>
            
            {/* Métadonnées */}
            <View style={styles.metadata}>
              <View style={styles.metadataItem}>
                <Ionicons name="time" size={16} color={Colors.text.secondary} />
                <Text style={styles.metadataText}>
                  {formatDuration(selectedTheme.duration)}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Ionicons name="leaf" size={16} color={Colors.text.secondary} />
                <Text style={styles.metadataText}>
                  {selectedTheme.category}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Ionicons name="star" size={16} color={Colors.text.secondary} />
                <Text style={styles.metadataText}>
                  {selectedTheme.difficulty}
                </Text>
              </View>
            </View>

            {/* Bénéfices */}
            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>Bénéfices :</Text>
              <View style={styles.benefitsList}>
                {selectedTheme.benefits.slice(0, 2).map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.nature[500]} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.previewButton,
            !selectedTheme && styles.disabledButton
          ]}
          onPress={handlePreviewAction}
          disabled={!selectedTheme}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="play-circle" 
            size={20} 
            color={selectedTheme ? Colors.primary[600] : Colors.text.tertiary} 
          />
          <Text style={[
            styles.actionButtonText,
            styles.previewButtonText,
            !selectedTheme && styles.disabledButtonText
          ]}>
            Aperçu (30s)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.immersionButton,
            !selectedTheme && styles.disabledButton
          ]}
          onPress={handleFullImmersionAction}
          disabled={!selectedTheme}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="headset" 
            size={20} 
            color={selectedTheme ? Colors.text.inverse : Colors.text.tertiary} 
          />
          <Text style={[
            styles.actionButtonText,
            styles.immersionButtonText,
            !selectedTheme && styles.disabledButtonText
          ]}>
            Immersion Complète
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: Spacing.sm,
    ...Shadows.card,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  carouselSection: {
    marginBottom: Spacing.lg,
  },
  carouselLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  carousel: {
    marginHorizontal: -Spacing.sm,
  },
  carouselContent: {
    paddingHorizontal: Spacing.sm,
  },
  selectedThemeInfo: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  themeDetails: {
    gap: Spacing.sm,
  },
  selectedThemeTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  selectedThemeDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metadataText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  benefits: {
    marginTop: Spacing.sm,
  },
  benefitsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  benefitsList: {
    gap: Spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  benefitText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  previewButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  immersionButton: {
    backgroundColor: Colors.primary[500],
  },
  disabledButton: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.light,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  previewButtonText: {
    color: Colors.primary[600],
  },
  immersionButtonText: {
    color: Colors.text.inverse,
  },
  disabledButtonText: {
    color: Colors.text.tertiary,
  },
});