import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { storageService } from '@/services/storageService';
import { googleAuthService } from '@/services/googleAuthService';

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  route?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userSession = await storageService.getUserSession();
      if (userSession) {
        setUser(userSession);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const notifications = await storageService.get<boolean>('notificationsEnabled') ?? true;
      const voice = await storageService.get<boolean>('voiceEnabled') ?? false;
      setNotificationsEnabled(notifications);
      setVoiceEnabled(voice);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await storageService.set('notificationsEnabled', value);
  };

  const handleVoiceToggle = async (value: boolean) => {
    setVoiceEnabled(value);
    await storageService.set('voiceEnabled', value);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await googleAuthService.signIn();
      
      if (result.type === 'success' && result.user) {
        setUser(result.user);
        Alert.alert(
          'Connexion réussie',
          `Bienvenue ${result.user.name} !`
        );
      } else if (result.type === 'cancel') {
        // L'utilisateur a annulé
      } else {
        Alert.alert(
          'Erreur de connexion',
          result.error || 'Une erreur est survenue lors de la connexion'
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        'Impossible de se connecter avec Google'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await googleAuthService.signOut();
            setUser(null);
            Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès');
          }
        }
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Effacer toutes les données',
      'Cette action supprimera définitivement toutes vos conversations, entrées de journal et paramètres. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await storageService.clear();
            Alert.alert('Données effacées', 'Toutes vos données ont été supprimées.');
          }
        }
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'notifications',
      title: 'Notifications push',
      icon: 'notifications',
      type: 'toggle',
      value: notificationsEnabled,
      onToggle: handleNotificationsToggle,
    },
    {
      id: 'voice',
      title: 'Synthèse vocale par défaut',
      icon: 'volume-high',
      type: 'toggle',
      value: voiceEnabled,
      onToggle: handleVoiceToggle,
    },
    {
      id: 'settings',
      title: 'Paramètres',
      icon: 'settings',
      type: 'navigation',
      route: '/settings',
    },
    {
      id: 'urgence',
      title: 'Ressources d\'urgence',
      icon: 'medical',
      type: 'navigation',
      route: '/urgence',
    },
    {
      id: 'about',
      title: 'À propos d\'Olivia',
      icon: 'information-circle',
      type: 'navigation',
      route: '/about',
    },
  ];

  const dangerousOptions: ProfileOption[] = [
    {
      id: 'clear',
      title: 'Effacer toutes les données',
      icon: 'trash',
      type: 'action',
      onPress: clearAllData,
    },
    {
      id: 'logout',
      title: 'Se déconnecter',
      icon: 'log-out',
      type: 'action',
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profil utilisateur */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color="#8E8E93" />
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>
            {user?.name || 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'Non connecté'}
          </Text>
          
          {user ? (
            <View style={styles.connectedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.connectedText}>Connecté avec Google</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.googleSignInButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color="#FFFFFF"
                style={styles.googleIcon}
              />
              <Text style={styles.googleSignInText}>
                {isLoading ? 'Connexion...' : 'Se connecter avec Google'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Statistiques rapides */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Votre parcours</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="chatbubble" size={24} color="#007AFF" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Conversations</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="book" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Entrées journal</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="leaf" size={24} color="#FF9800" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Séances détente</Text>
            </View>
          </View>
        </View>

        {/* Options principales */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionRow}
              onPress={option.type === 'navigation' ? () => router.push(option.route as any) : option.onPress}
              disabled={option.type === 'toggle'}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon as any} size={22} color="#007AFF" />
                <Text style={styles.optionTitle}>{option.title}</Text>
              </View>
              
              {option.type === 'toggle' ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onToggle}
                  trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                  thumbColor={'#FFFFFF'}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Options dangereuses */}
        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>Zone dangereuse</Text>
          {dangerousOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionRow, styles.dangerRow]}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon as any} size={22} color="#FF3B30" />
                <Text style={[styles.optionTitle, styles.dangerText]}>{option.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Version de l'app */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            Olivia Mobile v1.0.0
          </Text>
          <Text style={styles.versionSubtext}>
            Développé avec ❤️ pour votre bien-être
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
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 16,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  optionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionTitle: {
    fontSize: 16,
    color: '#000000',
  },
  dangerSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
  },
  dangerRow: {
    borderBottomColor: '#FFEBEE',
  },
  dangerText: {
    color: '#FF3B30',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    gap: 6,
  },
  connectedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  googleSignInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DB4437',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    marginRight: 4,
  },
  googleSignInText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});