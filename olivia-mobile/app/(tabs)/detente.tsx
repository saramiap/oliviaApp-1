import React from 'react';
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

interface DetenteOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

const detenteOptions: DetenteOption[] = [
  {
    id: 'breathing',
    title: 'Exercices de Respiration',
    description: 'Techniques guidées pour retrouver le calme',
    icon: 'flower',
    color: '#4CAF50',
    route: '/respiration'
  },
  {
    id: 'sound-journey',
    title: 'Voyages Sonores',
    description: 'Ambiances relaxantes et méditations',
    icon: 'musical-notes',
    color: '#2196F3',
    route: '/sound-journey'
  },
  {
    id: 'stress-program',
    title: 'Programme Anti-Stress',
    description: 'Programme adaptatif selon votre niveau',
    icon: 'shield-checkmark',
    color: '#FF9800',
    route: '/stress-programs'
  },
  {
    id: 'yoga',
    title: 'Programme Yoga',
    description: 'Sessions guidées pour corps et esprit',
    icon: 'body',
    color: '#9C27B0',
    route: '/detente/yoga'
  },
  {
    id: 'understanding',
    title: 'Comprendre le Stress',
    description: 'Informations et conseils pratiques',
    icon: 'bulb',
    color: '#607D8B',
    route: '/detente/comprendre-stress'
  }
];

export default function DetenteScreen() {
  const navigateToOption = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Détente & Bien-être</Text>
        <Text style={styles.headerSubtitle}>
          Trouvez votre moment de paix intérieure
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image d'en-tête */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Ionicons name="leaf" size={48} color="#4CAF50" />
            <Text style={styles.heroTitle}>Respirez profondément</Text>
            <Text style={styles.heroText}>
              Prenez un moment pour vous reconnecter avec votre bien-être intérieur
            </Text>
          </View>
        </View>

        {/* Options de détente */}
        <View style={styles.optionsContainer}>
          {detenteOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { borderLeftColor: option.color }]}
              onPress={() => navigateToOption(option.route)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                  <Ionicons name={option.icon as any} size={28} color={option.color} />
                </View>
                
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section conseils rapides */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Conseils Rapides</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Respiration 4-7-8</Text>
            <Text style={styles.tipText}>
              Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. 
              Répétez 3 fois pour un effet apaisant immédiat.
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Ancrage 5-4-3-2-1</Text>
            <Text style={styles.tipText}>
              Nommez 5 choses que vous voyez, 4 que vous touchez, 
              3 que vous entendez, 2 que vous sentez, 1 que vous goûtez.
            </Text>
          </View>
        </View>

        {/* Accès rapide urgence */}
        <TouchableOpacity 
          style={styles.urgencyCard}
          onPress={() => router.push('/urgence')}
        >
          <View style={styles.urgencyContent}>
            <Ionicons name="medical" size={24} color="#FF3B30" />
            <View style={styles.urgencyInfo}>
              <Text style={styles.urgencyTitle}>Besoin d'aide immédiate ?</Text>
              <Text style={styles.urgencyText}>
                Accédez aux ressources d'urgence et numéros utiles
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FF3B30" />
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    padding: 16,
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    // shadowColor: '#000', // Commenté pour éviter les warnings
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 1.41,
    elevation: 2, // Garde elevation pour Android
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  tipsSection: {
    padding: 16,
    paddingTop: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  urgencyCard: {
    margin: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  urgencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  urgencyInfo: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  urgencyText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});