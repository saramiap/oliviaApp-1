import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ContextualChatMessage, ContextualAction } from '../src/types/chat';
import ContextualMessageBubble from '../src/components/ContextualMessageBubble';
import { Colors } from '../src/constants/Colors';
import { Spacing, BorderRadius, Typography, Shadows } from '../src/constants/Design';

interface TestSection {
  id: string;
  title: string;
  description: string;
  messages: ContextualChatMessage[];
}

export default function TestContextualScreen() {
  const [selectedSection, setSelectedSection] = useState<string>('sound_journey');

  // Messages de test pour chaque type d'interface contextuelle
  const testSections: TestSection[] = [
    {
      id: 'sound_journey',
      title: 'Voyages Sonores',
      description: 'Test de l\'interface immersive pour les voyages sonores avec carousel interactif',
      messages: [
        {
          id: '1',
          from: 'model',
          text: 'Je vous propose une expérience de voyage sonore pour vous détendre. Choisissez l\'environnement qui vous attire le plus.',
          contextualAction: {
            type: 'VOYAGE_SONORE',
            contextType: 'immersive',
            params: {
              themeId: 'forest'
            },
            metadata: {
              title: 'Voyages Sonores Disponibles',
              description: 'Choisissez votre environnement sonore pour une expérience immersive'
            }
          }
        }
      ]
    },
    {
      id: 'breathing_exercises',
      title: 'Exercices de Respiration',
      description: 'Test de l\'interface pour les exercices de respiration avec sélection de pattern et durée',
      messages: [
        {
          id: '2',
          from: 'model',
          text: 'Prenons un moment pour nous recentrer avec un exercice de respiration. Je vous guide vers la technique qui vous convient.',
          contextualAction: {
            type: 'EXERCICE_RESPIRATION',
            contextType: 'immersive',
            params: {
              exerciseId: 'box_breathing',
              duration: 300,
              cycles: 10
            },
            metadata: {
              title: 'Exercices de Respiration',
              description: 'Choisissez un exercice adapté à vos besoins du moment'
            }
          }
        }
      ]
    },
    {
      id: 'journal_prompts',
      title: 'Suggestions de Journal',
      description: 'Test de l\'interface pour les suggestions de journal avec questions réflexives',
      messages: [
        {
          id: '3',
          from: 'model',
          text: 'L\'écriture peut être un excellent moyen d\'explorer vos pensées et émotions. Voici quelques suggestions pour commencer.',
          contextualAction: {
            type: 'SUGGESTION_JOURNAL',
            contextType: 'immersive',
            params: {
              promptId: 'daily_gratitude',
              lastEntry: 'Aujourd\'hui j\'ai été reconnaissant pour le soleil qui brillait et la conversation enrichissante avec mon collègue...'
            },
            metadata: {
              title: 'Suggestions de Journal',
              description: 'Explorez vos pensées et émotions à travers l\'écriture réflexive'
            }
          }
        }
      ]
    },
    {
      id: 'preview_actions',
      title: 'Actions Preview',
      description: 'Test des interfaces de preview pour différents types d\'actions',
      messages: [
        {
          id: '4',
          from: 'model',
          text: 'Voici un exercice de respiration rapide pour vous aider à vous recentrer.',
          contextualAction: {
            type: 'EXERCICE_RESPIRATION',
            contextType: 'preview',
            params: {
              type: 'cohérence cardiaque',
              duration: 300,
              cycles: 15
            },
            metadata: {
              title: 'Cohérence Cardiaque',
              description: 'Exercice de respiration 5-5 pour équilibrer votre système nerveux',
              previewData: {
                duration: 300,
                cycles: 15
              }
            }
          }
        },
        {
          id: '5',
          from: 'model',
          text: 'Que diriez-vous d\'écrire dans votre journal aujourd\'hui ?',
          contextualAction: {
            type: 'SUGGESTION_JOURNAL',
            contextType: 'preview',
            params: {
              prompt: 'Quelles sont les trois choses pour lesquelles vous êtes reconnaissant(e) aujourd\'hui ?'
            },
            metadata: {
              title: 'Gratitude Quotidienne',
              description: 'Cultivez un état d\'esprit positif en identifiant les bénédictions quotidiennes',
              previewData: {
                prompt: 'Quelles sont les trois choses pour lesquelles vous êtes reconnaissant(e) aujourd\'hui ?'
              }
            }
          }
        }
      ]
    },
    {
      id: 'simple_actions',
      title: 'Actions Simples',
      description: 'Test des boutons d\'action simples pour navigation et informations',
      messages: [
        {
          id: '6',
          from: 'model',
          text: 'Pour en apprendre davantage sur la gestion du stress, je vous invite à consulter notre guide complet.',
          contextualAction: {
            type: 'INFO_STRESS',
            contextType: 'simple',
            params: {
              sujet: 'gestion_stress_avancee'
            },
            metadata: {
              title: 'Guide de Gestion du Stress'
            }
          }
        },
        {
          id: '7',
          from: 'model',
          text: 'Vous pouvez également accéder directement à votre page de préférences.',
          contextualAction: {
            type: 'REDIRECT',
            contextType: 'simple',
            params: {
              path: '/settings/preferences'
            },
            metadata: {
              title: 'Ouvrir les Préférences'
            }
          }
        }
      ]
    }
  ];

  const currentSection = testSections.find(section => section.id === selectedSection);

  const handleActionPress = (actionName: string, params: any) => {
    Alert.alert(
      'Action Déclenchée',
      `Action: ${actionName}\n\nParamètres:\n${JSON.stringify(params, null, 2)}`,
      [{ text: 'OK' }]
    );
  };

  const renderSectionSelector = () => (
    <View style={styles.sectionSelector}>
      <Text style={styles.selectorTitle}>Type d'Interface à Tester</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {testSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.sectionButton,
              selectedSection === section.id && styles.selectedSectionButton
            ]}
            onPress={() => setSelectedSection(section.id)}
          >
            <Text style={[
              styles.sectionButtonText,
              selectedSection === section.id && styles.selectedSectionButtonText
            ]}>
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTestInfo = () => {
    if (!currentSection) return null;

    return (
      <View style={styles.testInfo}>
        <Text style={styles.testTitle}>{currentSection.title}</Text>
        <Text style={styles.testDescription}>{currentSection.description}</Text>
        <View style={styles.testMetrics}>
          <View style={styles.metric}>
            <Ionicons name="chatbubbles" size={16} color={Colors.primary[500]} />
            <Text style={styles.metricText}>{currentSection.messages.length} messages</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="layers" size={16} color={Colors.nature[500]} />
            <Text style={styles.metricText}>
              {currentSection.messages[0]?.contextualAction?.contextType || 'mixed'} interface
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMessages = () => {
    if (!currentSection) return null;

    return (
      <View style={styles.messagesContainer}>
        <Text style={styles.messagesTitle}>Messages de Test</Text>
        {currentSection.messages.map((message) => (
          <ContextualMessageBubble
            key={message.id}
            message={message}
            onActionPress={handleActionPress}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="flask" size={24} color={Colors.primary[500]} />
          <Text style={styles.headerTitle}>Test - Interfaces Contextuelles</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Phase 3 - Validation du système d'interfaces contextuelles
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sélecteur de section */}
        {renderSectionSelector()}
        
        {/* Informations de test */}
        {renderTestInfo()}
        
        {/* Messages de test */}
        {renderMessages()}
        
        {/* Instructions d'utilisation */}
        <View style={styles.instructions}>
          <View style={styles.instructionsHeader}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.instructionsTitle}>Instructions de Test</Text>
          </View>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>• Sélectionnez un type d'interface à tester</Text>
            <Text style={styles.instructionItem}>• Interagissez avec les éléments de l'interface</Text>
            <Text style={styles.instructionItem}>• Les actions déclenchent des alertes avec les paramètres</Text>
            <Text style={styles.instructionItem}>• Testez la fluidité et la cohérence visuelle</Text>
            <Text style={styles.instructionItem}>• Vérifiez la performance sur différents types de contenu</Text>
          </View>
        </View>
        
        {/* Résultats attendus */}
        <View style={styles.expectedResults}>
          <View style={styles.resultsHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.resultsTitle}>Résultats Attendus</Text>
          </View>
          <View style={styles.resultsList}>
            <Text style={styles.resultItem}>✅ Affichage correct de toutes les interfaces</Text>
            <Text style={styles.resultItem}>✅ Interactions fluides (sélection, navigation, actions)</Text>
            <Text style={styles.resultItem}>✅ Cohérence des données et paramètres</Text>
            <Text style={styles.resultItem}>✅ Performance optimisée pour mobile</Text>
            <Text style={styles.resultItem}>✅ Gestion des états de chargement et d'erreur</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  
  // Sélecteur de section
  sectionSelector: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.secondary,
  },
  selectorTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  sectionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedSectionButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  sectionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  selectedSectionButtonText: {
    color: Colors.text.inverse,
  },
  
  // Informations de test
  testInfo: {
    padding: Spacing.lg,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  testTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  testDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  testMetrics: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  
  // Messages
  messagesContainer: {
    padding: Spacing.lg,
  },
  messagesTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  // Instructions
  instructions: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  instructionsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  instructionsList: {
    gap: Spacing.sm,
  },
  instructionItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  // Résultats attendus
  expectedResults: {
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.nature[50],
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resultsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  resultsList: {
    gap: Spacing.sm,
  },
  resultItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
});