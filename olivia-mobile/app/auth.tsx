import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { storageService } from '@/services/storageService';

export default function AuthScreen() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailPasswordAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!isLoginView && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // Simulation d'authentification (à remplacer par vraie auth)
      const mockUser = {
        id: 'email_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        picture: null,
        given_name: email.split('@')[0],
        family_name: '',
        email_verified: true,
        auth_method: 'email'
      };

      await storageService.saveUserSession(mockUser);
      
      Alert.alert(
        'Succès', 
        isLoginView ? 'Connexion réussie !' : 'Compte créé avec succès !',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
      
    } catch (error) {
      console.error('Erreur auth:', error);
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de l\'authentification');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    Alert.alert(
      'Google Auth',
      'L\'authentification Google sera disponible dans la prochaine version',
      [{ text: 'OK' }]
    );
  };

  const handleGuestAccess = () => {
    Alert.alert(
      'Accès invité',
      'Voulez-vous continuer sans compte ? Vos données ne seront pas sauvegardées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer', 
          onPress: () => router.replace('/(tabs)') 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.appName}>Olivia Sérenis</Text>
          <Text style={styles.headerTitle}>
            {isLoginView ? 'Bon retour !' : 'Créer un compte'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isLoginView 
              ? 'Connectez-vous pour accéder à votre espace personnel' 
              : 'Rejoignez-nous pour commencer votre parcours bien-être'}
          </Text>
        </View>

        {/* Google Auth Button */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleAuth}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleButtonText}>
            {isLoginView ? 'Continuer avec Google' : 'S\'inscrire avec Google'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="mail" size={16} color="#8E8E93" /> Email
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="lock-closed" size={16} color="#8E8E93" /> Mot de passe
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLoginView && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="lock-closed" size={16} color="#8E8E93" /> Confirmer mot de passe
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.authButton, loading && styles.authButtonDisabled]} 
            onPress={handleEmailPasswordAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons 
                  name={isLoginView ? "log-in" : "person-add"} 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.authButtonText}>
                  {isLoginView ? 'Se connecter' : 'Créer le compte'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Switch between login/signup */}
        <View style={styles.authSwitcher}>
          <Text style={styles.switcherText}>
            {isLoginView ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
          </Text>
          <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)}>
            <Text style={styles.switcherButton}>
              {isLoginView ? 'S\'inscrire' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest access */}
        <TouchableOpacity style={styles.guestButton} onPress={handleGuestAccess}>
          <Ionicons name="eye" size={16} color="#8E8E93" />
          <Text style={styles.guestButtonText}>Continuer sans compte</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 24,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  authButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  authSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  switcherText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  switcherButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
    gap: 8,
  },
  guestButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});