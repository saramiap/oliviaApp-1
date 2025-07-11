import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface StressSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: {
    description: string;
    keyPoints: string[];
    tips?: string[];
  };
}

const stressSections: StressSection[] = [
  {
    id: 'what-is-stress',
    title: 'Qu\'est-ce que le stress ?',
    icon: 'help-circle',
    color: '#007AFF',
    content: {
      description: 'Le stress est une réaction naturelle de notre organisme face à une situation perçue comme menaçante ou exigeante. C\'est un mécanisme de survie qui nous aide à nous adapter.',
      keyPoints: [
        'Réaction physiologique normale',
        'Mécanisme d\'adaptation ancestral',
        'Libération d\'hormones (cortisol, adrénaline)',
        'Peut être positif ou négatif selon l\'intensité et la durée'
      ]
    }
  },
  {
    id: 'good-bad-stress',
    title: 'Bon stress vs Mauvais stress',
    icon: 'scale',
    color: '#4CAF50',
    content: {
      description: 'Tous les stress ne sont pas égaux. Il existe une différence fondamentale entre le stress stimulant et le stress destructeur.',
      keyPoints: [
        'Bon stress (eustress) : motivation, performance, créativité',
        'Mauvais stress (détresse) : épuisement, anxiété, problèmes de santé',
        'Durée : ponctuel vs chronique',
        'Perception : défi vs menace'
      ],
      tips: [
        'Identifiez vos sources de stress',
        'Changez votre perspective sur les défis',
        'Prenez des pauses régulières'
      ]
    }
  },
  {
    id: 'symptoms',
    title: 'Reconnaître les symptômes',
    icon: 'warning',
    color: '#FF9800',
    content: {
      description: 'Le stress peut se manifester de différentes façons. Apprendre à reconnaître ces signaux est la première étape pour mieux le gérer.',
      keyPoints: [
        'Physiques : tensions, fatigue, maux de tête, troubles digestifs',
        'Émotionnels : irritabilité, anxiété, tristesse, colère',
        'Comportementaux : isolation, procrastination, troubles du sommeil',
        'Cognitifs : difficultés de concentration, oublis, ruminations'
      ],
      tips: [
        'Tenez un journal de vos symptômes',
        'Notez les situations déclenchantes',
        'Consultez si les symptômes persistent'
      ]
    }
  },
  {
    id: 'causes',
    title: 'Les principales causes',
    icon: 'analytics',
    color: '#9C27B0',
    content: {
      description: 'Comprendre les sources de stress nous aide à mieux les anticiper et les gérer. Chaque personne réagit différemment selon son vécu et sa personnalité.',
      keyPoints: [
        'Professionnelles : surcharge, conflits, insécurité',
        'Personnelles : relations, santé, finances',
        'Environnementales : bruit, pollution, transports',
        'Internes : perfectionnisme, autocritique, peurs'
      ],
      tips: [
        'Identifiez vos facteurs de stress personnels',
        'Classez-les entre contrôlables et non-contrôlables',
        'Concentrez-vous sur ce que vous pouvez changer'
      ]
    }
  },
  {
    id: 'management',
    title: 'Techniques de gestion',
    icon: 'construct',
    color: '#FF5722',
    content: {
      description: 'Il existe de nombreuses stratégies pour gérer le stress efficacement. La clé est de trouver celles qui vous conviennent le mieux.',
      keyPoints: [
        'Respiration profonde et méditation',
        'Activité physique régulière',
        'Organisation et planification',
        'Communication et soutien social'
      ],
      tips: [
        'Pratiquez la règle des 3x8 : 8h de travail, 8h de loisirs, 8h de sommeil',
        'Apprenez à dire non',
        'Développez votre réseau de soutien',
        'Cultivez des activités plaisantes'
      ]
    }
  },
  {
    id: 'prevention',
    title: 'Prévention au quotidien',
    icon: 'shield-checkmark',
    color: '#607D8B',
    content: {
      description: 'La meilleure approche est préventive. En adoptant de bonnes habitudes au quotidien, nous renforçons notre résistance au stress.',
      keyPoints: [
        'Hygiène de vie : sommeil, alimentation, exercice',
        'Gestion du temps et des priorités',
        'Moments de détente et de plaisir',
        'Développement de la résilience'
      ],
      tips: [
        'Établissez une routine équilibrée',
        'Pratiquez la gratitude quotidiennement',
        'Maintenez des relations sociales positives',
        'Accordez-vous du temps pour vous'
      ]
    }
  }
];

export default function UnderstandingStressScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprendre le Stress</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introIcon}>
            <Ionicons name="bulb" size={48} color="#607D8B" />
          </View>
          <Text style={styles.introTitle}>Démystifions le stress</Text>
          <Text style={styles.introText}>
            Le stress fait partie de la vie, mais mieux le comprendre nous permet de mieux le gérer. 
            Explorez les différents aspects du stress pour développer vos stratégies personnelles.
          </Text>
        </View>

        {/* Message d'encouragement */}
        <View style={styles.encouragementCard}>
          <Ionicons name="heart" size={24} color="#FF3B30" />
          <View style={styles.encouragementContent}>
            <Text style={styles.encouragementTitle}>Vous n'êtes pas seul(e)</Text>
            <Text style={styles.encouragementText}>
              Tout le monde vit du stress. L'important est d'apprendre à le reconnaître et à le gérer sainement.
            </Text>
          </View>
        </View>

        {/* Sections interactives */}
        <View style={styles.sectionsContainer}>
          {stressSections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <TouchableOpacity
                style={[styles.sectionHeader, { borderLeftColor: section.color }]}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                    <Ionicons name={section.icon as any} size={24} color={section.color} />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Ionicons 
                  name={expandedSection === section.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#8E8E93" 
                />
              </TouchableOpacity>

              {expandedSection === section.id && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionDescription}>
                    {section.content.description}
                  </Text>
                  
                  <View style={styles.keyPointsContainer}>
                    <Text style={styles.keyPointsTitle}>Points clés :</Text>
                    {section.content.keyPoints.map((point, index) => (
                      <View key={index} style={styles.keyPoint}>
                        <Text style={styles.keyPointBullet}>•</Text>
                        <Text style={styles.keyPointText}>{point}</Text>
                      </View>
                    ))}
                  </View>

                  {section.content.tips && (
                    <View style={styles.tipsContainer}>
                      <Text style={styles.tipsTitle}>💡 Conseils pratiques :</Text>
                      {section.content.tips.map((tip, index) => (
                        <View key={index} style={styles.tip}>
                          <Text style={styles.tipBullet}>✓</Text>
                          <Text style={styles.tipText}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Ressources supplémentaires */}
        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>🔗 Ressources utiles</Text>
          
          <TouchableOpacity 
            style={styles.resourceCard}
            onPress={() => router.push('/stress-programs')}
          >
            <Ionicons name="fitness" size={24} color="#4CAF50" />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Programme Anti-Stress</Text>
              <Text style={styles.resourceDescription}>
                Exercices pratiques pour gérer votre stress au quotidien
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resourceCard}
            onPress={() => router.push('/sound-journey')}
          >
            <Ionicons name="musical-notes" size={24} color="#2196F3" />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Voyages Sonores</Text>
              <Text style={styles.resourceDescription}>
                Méditations guidées et ambiances relaxantes
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resourceCard}
            onPress={() => router.push('/urgence')}
          >
            <Ionicons name="medical" size={24} color="#FF3B30" />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Aide d'urgence</Text>
              <Text style={styles.resourceDescription}>
                Ressources pour les moments de crise
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Message final */}
        <View style={styles.finalMessage}>
          <Text style={styles.finalTitle}>🌟 Rappelez-vous</Text>
          <Text style={styles.finalText}>
            Gérer le stress est un apprentissage continu. Soyez patient(e) avec vous-même et 
            n'hésitez pas à demander de l'aide si nécessaire. Chaque petit pas compte !
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  introSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  introIcon: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  encouragementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    alignItems: 'center',
  },
  encouragementContent: {
    flex: 1,
    marginLeft: 12,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  encouragementText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  sectionsContainer: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderLeftWidth: 4,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
    marginBottom: 16,
  },
  keyPointsContainer: {
    marginBottom: 16,
  },
  keyPointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  keyPointBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    fontWeight: 'bold',
  },
  keyPointText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 13,
    color: '#666666',
    flex: 1,
    lineHeight: 18,
  },
  resourcesSection: {
    padding: 16,
    paddingTop: 24,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  resourceContent: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  finalMessage: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  finalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  finalText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});