import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  JournalPrompt, 
  getRecommendedPrompts, 
  getRandomQuote,
  formatEstimatedTime,
  getCategoryColor,
  MotivationalQuote
} from '../../data/journalPrompts';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius, Typography, Shadows } from '../../constants/Design';

interface JournalPreviewProps {
  params?: { promptId?: string; lastEntry?: string };
  onAction: (actionName: string, params: any) => void;
}

export default function JournalPreview({ 
  params, 
  onAction 
}: JournalPreviewProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);
  const [motivationalQuote] = useState<MotivationalQuote>(getRandomQuote());
  
  const availablePrompts = getRecommendedPrompts();

  // Si un promptId est fourni dans les params, sélectionner ce prompt
  React.useEffect(() => {
    if (params?.promptId) {
      const preselectedPrompt = availablePrompts.find(prompt => prompt.id === params.promptId);
      if (preselectedPrompt) {
        setSelectedPrompt(preselectedPrompt);
      }
    }
  }, [params?.promptId, availablePrompts]);

  const handlePromptSelect = (prompt: JournalPrompt) => {
    setSelectedPrompt(prompt);
  };

  const handleWriteNowAction = () => {
    if (!selectedPrompt) return;
    
    onAction('OPEN_JOURNAL_WITH_PROMPT', {
      promptId: selectedPrompt.id,
      question: selectedPrompt.question,
      title: selectedPrompt.title,
      estimatedTime: selectedPrompt.estimatedTime
    });
  };

  const handleViewJournalAction = () => {
    onAction('VIEW_JOURNAL_ENTRIES', {
      category: selectedPrompt?.category || 'all'
    });
  };

  const renderLastEntry = () => {
    if (!params?.lastEntry) return null;
    
    return (
      <View style={styles.lastEntryContainer}>
        <View style={styles.lastEntryHeader}>
          <Ionicons name="time" size={16} color={Colors.text.secondary} />
          <Text style={styles.lastEntryTitle}>Dernière entrée</Text>
        </View>
        <Text style={styles.lastEntryText} numberOfLines={3}>
          {params.lastEntry}
        </Text>
        <TouchableOpacity style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>Lire la suite</Text>
          <Ionicons name="chevron-forward" size={12} color={Colors.primary[500]} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMotivationalQuote = () => (
    <View style={styles.quoteContainer}>
      <View style={styles.quoteHeader}>
        <Ionicons name="sparkles" size={16} color={Colors.warm[500]} />
        <Text style={styles.quoteLabel}>Citation du jour</Text>
      </View>
      <Text style={styles.quoteText}>"{motivationalQuote.text}"</Text>
      <Text style={styles.quoteAuthor}>— {motivationalQuote.author}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="book" size={24} color={Colors.primary[500]} />
          <Text style={styles.title}>Suggestions de Journal</Text>
        </View>
        <Text style={styles.subtitle}>
          Explorez vos pensées et émotions à travers l'écriture réflexive
        </Text>
      </View>

      {/* Citation motivante */}
      {renderMotivationalQuote()}

      {/* Sélection du prompt */}
      <View style={styles.promptSelection}>
        <Text style={styles.sectionLabel}>Questions Suggérées</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptCarousel}
        >
          {availablePrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt.id}
              style={[
                styles.promptCard,
                selectedPrompt?.id === prompt.id && styles.selectedPromptCard
              ]}
              onPress={() => handlePromptSelect(prompt)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.promptIcon,
                { backgroundColor: getCategoryColor(prompt.category) + '20' }
              ]}>
                <Ionicons 
                  name={prompt.icon as any} 
                  size={20} 
                  color={getCategoryColor(prompt.category)} 
                />
              </View>
              <Text style={styles.promptTitle} numberOfLines={2}>
                {prompt.title}
              </Text>
              <Text style={styles.promptCategory}>
                {prompt.category}
              </Text>
              <View style={styles.promptMeta}>
                <Ionicons name="time" size={12} color={Colors.text.tertiary} />
                <Text style={styles.promptTime}>
                  {formatEstimatedTime(prompt.estimatedTime)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Détails du prompt sélectionné */}
      {selectedPrompt && (
        <View style={styles.selectedPromptDetails}>
          <Text style={styles.selectedPromptTitle}>{selectedPrompt.title}</Text>
          <Text style={styles.selectedPromptDescription}>
            {selectedPrompt.description}
          </Text>
          
          {/* Question principale */}
          <View style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Ionicons name="help-circle" size={16} color={Colors.primary[500]} />
              <Text style={styles.questionLabel}>Question de réflexion :</Text>
            </View>
            <Text style={styles.questionText}>
              {selectedPrompt.question}
            </Text>
          </View>
          
          {/* Instructions */}
          <Text style={styles.instructionsText}>
            Prenez {selectedPrompt.estimatedTime} minutes pour réfléchir et écrire vos pensées.
          </Text>
          
          {/* Bénéfices */}
          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Bénéfices de cet exercice :</Text>
            <View style={styles.benefitsList}>
              {selectedPrompt.benefits.slice(0, 2).map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.nature[500]} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Questions de suivi */}
          {selectedPrompt.followUpQuestions && selectedPrompt.followUpQuestions.length > 0 && (
            <View style={styles.followUpContainer}>
              <Text style={styles.followUpTitle}>Questions d'approfondissement :</Text>
              {selectedPrompt.followUpQuestions.slice(0, 2).map((question, index) => (
                <View key={index} style={styles.followUpItem}>
                  <Text style={styles.followUpBullet}>•</Text>
                  <Text style={styles.followUpText}>{question}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Dernière entrée */}
      {renderLastEntry()}

      {/* Boutons d'action */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.viewJournalButton,
          ]}
          onPress={handleViewJournalAction}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="library" 
            size={20} 
            color={Colors.primary[600]} 
          />
          <Text style={[
            styles.actionButtonText,
            styles.viewJournalButtonText,
          ]}>
            Voir le Journal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.writeButton,
            !selectedPrompt && styles.disabledButton
          ]}
          onPress={handleWriteNowAction}
          disabled={!selectedPrompt}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="create" 
            size={20} 
            color={selectedPrompt ? Colors.text.inverse : Colors.text.tertiary} 
          />
          <Text style={[
            styles.actionButtonText,
            styles.writeButtonText,
            !selectedPrompt && styles.disabledButtonText
          ]}>
            Écrire Maintenant
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
  
  // Citation motivante
  quoteContainer: {
    backgroundColor: Colors.warm[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warm[500],
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  quoteLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.warm[700],
  },
  quoteText: {
    fontSize: Typography.fontSize.md,
    fontStyle: 'italic',
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
    marginBottom: Spacing.xs,
  },
  quoteAuthor: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  
  // Sélection de prompt
  promptSelection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  promptCarousel: {
    paddingHorizontal: Spacing.xs,
  },
  promptCard: {
    width: 140,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  selectedPromptCard: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
    ...Shadows.medium,
  },
  promptIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  promptCategory: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  promptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  promptTime: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  
  // Détails du prompt sélectionné
  selectedPromptDetails: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  selectedPromptTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  selectedPromptDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  
  // Question principale
  questionContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  questionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  questionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.md,
    fontStyle: 'italic',
  },
  instructionsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  
  // Bénéfices
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
  
  // Questions de suivi
  followUpContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.spiritual[50],
    borderRadius: BorderRadius.sm,
  },
  followUpTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  followUpBullet: {
    fontSize: Typography.fontSize.sm,
    color: Colors.spiritual[500],
    fontWeight: Typography.fontWeight.bold,
    marginTop: 2,
  },
  followUpText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  // Dernière entrée
  lastEntryContainer: {
    backgroundColor: Colors.nature[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.nature[500],
  },
  lastEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  lastEntryTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  lastEntryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.medium,
  },
  
  // Boutons d'action
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
  viewJournalButton: {
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  writeButton: {
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
  viewJournalButtonText: {
    color: Colors.primary[600],
  },
  writeButtonText: {
    color: Colors.text.inverse,
  },
  disabledButtonText: {
    color: Colors.text.tertiary,
  },
});