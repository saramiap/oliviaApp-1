import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface EmergencyContact {
  id: string;
  label: string;
  number: string;
  description: string;
  icon: string;
  color: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: 'suicide',
    label: 'Prévention du Suicide',
    number: '3114',
    description: 'Écoute professionnelle, confidentielle et gratuite, 24h/24 et 7j/7.',
    icon: 'heart',
    color: '#FF6B6B',
  },
  {
    id: 'europe',
    label: 'Urgences (Police, Pompiers, SAMU)',
    number: '112',
    description: 'Numéro d\'appel d\'urgence européen accessible gratuitement partout en UE.',
    icon: 'medical',
    color: '#FF3B30',
  },
  {
    id: 'violences-femmes',
    label: 'Violences Femmes Info',
    number: '3919',
    description: 'Écoute, informe et oriente les femmes victimes de violences.',
    icon: 'shield-checkmark',
    color: '#9C27B0',
  },
  {
    id: 'enfance-danger',
    label: 'Enfance en Danger',
    number: '119',
    description: 'Service national d\'accueil téléphonique pour l\'enfance en danger.',
    icon: 'people',
    color: '#FF9800',
  },
  {
    id: 'harcelement',
    label: 'Harcèlement',
    number: '3020',
    description: 'Le numéro national contre toutes les formes de harcèlement, y compris cyberharcèlement.',
    icon: 'alert-circle',
    color: '#607D8B',
  },
];

export default function UrgenceScreen() {
  const handleCall = (number: string, label: string) => {
    const phoneNumber = `tel:${number.replace(/\s/g, '')}`;
    
    Alert.alert(
      'Confirmer l\'appel',
      `Voulez-vous appeler ${label} au ${number} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            Linking.openURL(phoneNumber).catch((err) => {
              console.error('Erreur lors de l\'ouverture du téléphone:', err);
              Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
            });
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Urgence</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Message principal */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="heart" size={48} color="#FF6B6B" />
          </View>
          <Text style={styles.heroTitle}>
            Vous n'êtes pas seul·e 💛
          </Text>
          <Text style={styles.heroSubtitle}>
            Si vous traversez une période difficile ou si vous avez besoin d'aide immédiate, 
            des professionnels sont là pour vous écouter, gratuitement et anonymement.
          </Text>
        </View>

        {/* Liste des contacts d'urgence */}
        <View style={styles.contactsList}>
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <View style={[styles.contactIcon, { backgroundColor: `${contact.color}20` }]}>
                  <Ionicons name={contact.icon as any} size={24} color={contact.color} />
                </View>
                
                <View style={styles.contactDetails}>
                  <Text style={styles.contactLabel}>{contact.label}</Text>
                  <Text style={styles.contactDescription}>{contact.description}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: contact.color }]}
                onPress={() => handleCall(contact.number, contact.label)}
              >
                <Ionicons name="call" size={18} color="#FFFFFF" />
                <Text style={styles.callButtonText}>{contact.number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Message de soutien */}
        <View style={styles.supportMessage}>
          <Text style={styles.supportText}>
            💪 Tendre la main est un signe de courage. Vous êtes important·e.
          </Text>
        </View>

        {/* Conseils rapides */}
        <View style={styles.quickTips}>
          <Text style={styles.tipsTitle}>💡 En attendant de l'aide</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Respirez profondément</Text>
            <Text style={styles.tipText}>
              Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 3 fois.
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Restez en sécurité</Text>
            <Text style={styles.tipText}>
              Éloignez-vous de toute situation dangereuse et rejoignez un lieu sûr.
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Contactez un proche</Text>
            <Text style={styles.tipText}>
              Si possible, appelez quelqu'un de confiance pour vous accompagner.
            </Text>
          </View>
        </View>

        {/* Retour vers l'app */}
        <TouchableOpacity style={styles.returnButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={20} color="#007AFF" />
          <Text style={styles.returnButtonText}>Retourner à l'application</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  contactsList: {
    gap: 16,
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  supportMessage: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  supportText: {
    fontSize: 16,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  quickTips: {
    marginBottom: 24,
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
    borderLeftColor: '#007AFF',
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
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
    gap: 8,
  },
  returnButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});