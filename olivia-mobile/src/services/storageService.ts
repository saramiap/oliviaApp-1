import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { ChatMessage, Conversation } from '@/types/chat';

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Stockage général (AsyncStorage)
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      // Nettoyer aussi les données sécurisées
      const secureKeys = ['userSession', 'authToken', 'refreshToken'];
      for (const key of secureKeys) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (e) {
          // Clé peut ne pas exister
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage complet:', error);
    }
  }

  // Stockage sécurisé (SecureStore) pour données sensibles
  async setSecure(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde sécurisée de ${key}:`, error);
    }
  }

  async getSecure(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error: any) {
      // Gestion silencieuse des erreurs pour les clés inexistantes
      console.warn(`Clé sécurisée ${key} non trouvée ou erreur SecureStore:`, error?.message || error);
      return null;
    }
  }

  async removeSecure(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression sécurisée de ${key}:`, error);
    }
  }

  // Méthodes spécialisées pour l'app
  async saveChatMessages(messages: ChatMessage[]): Promise<void> {
    await this.set('chatMessages', messages);
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    const messages = await this.get<ChatMessage[]>('chatMessages');
    return messages || [];
  }

  async saveConversationHistory(conversations: Conversation[]): Promise<void> {
    await this.set('conversationHistory', conversations);
  }

  async getConversationHistory(): Promise<Conversation[]> {
    const history = await this.get<Conversation[]>('conversationHistory');
    return history || [];
  }

  async saveUserSession(userSession: any): Promise<void> {
    await this.setSecure('userSession', JSON.stringify(userSession));
  }

  async getUserSession(): Promise<any> {
    const sessionData = await this.getSecure('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async clearUserSession(): Promise<void> {
    await this.removeSecure('userSession');
    await this.removeSecure('authToken');
    await this.removeSecure('refreshToken');
  }

  // Token d'authentification
  async saveAuthToken(token: string): Promise<void> {
    await this.setSecure('authToken', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getSecure('authToken');
  }

  async saveRefreshToken(token: string): Promise<void> {
    await this.setSecure('refreshToken', token);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.getSecure('refreshToken');
  }
}

export const storageService = StorageService.getInstance();