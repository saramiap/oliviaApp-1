import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { storageService } from './storageService';

// Complète la session d'authentification pour Web
WebBrowser.maybeCompleteAuthSession();

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

interface AuthResult {
  type: 'success' | 'error' | 'cancel';
  user?: GoogleUser;
  error?: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  
  // Configuration OAuth2 Google
  private readonly clientId = '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'; // À remplacer par votre vrai client ID
  private readonly redirectUri = AuthSession.makeRedirectUri({
    scheme: 'olivia-mobile',
    path: 'auth'
  });

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Initie le processus de connexion Google
   */
  async signIn(): Promise<AuthResult> {
    try {
      // Génération du code verifier pour PKCE
      const codeChallenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36).substring(2, 15),
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );

      // Configuration de la requête d'autorisation
      const authRequest = new AuthSession.AuthRequest({
        clientId: this.clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: this.redirectUri,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        extraParams: {
          access_type: 'offline', // Pour obtenir un refresh token
        },
      });

      // Démarrer la session d'authentification
      const result = await authRequest.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.code) {
        // Échanger le code contre un token d'accès
        const tokenResult = await this.exchangeCodeForToken(
          result.params.code,
          codeChallenge
        );

        if (tokenResult.access_token) {
          // Récupérer les informations utilisateur
          const userInfo = await this.fetchUserInfo(tokenResult.access_token);
          
          // Sauvegarder la session utilisateur
          await this.saveUserSession(userInfo, tokenResult);

          return {
            type: 'success',
            user: userInfo
          };
        }
      } else if (result.type === 'cancel') {
        return { type: 'cancel' };
      }

      return {
        type: 'error',
        error: 'Erreur lors de l\'authentification'
      };

    } catch (error: any) {
      console.error('Erreur lors de la connexion Google:', error);
      return {
        type: 'error',
        error: error.message || 'Erreur inconnue lors de la connexion'
      };
    }
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  private async exchangeCodeForToken(code: string, codeVerifier: string) {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'échange du code');
    }

    return response.json();
  }

  /**
   * Récupère les informations utilisateur depuis l'API Google
   */
  private async fetchUserInfo(accessToken: string): Promise<GoogleUser> {
    const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v2/userinfo';
    
    const response = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations utilisateur');
    }

    return response.json();
  }

  /**
   * Sauvegarde la session utilisateur
   */
  private async saveUserSession(user: GoogleUser, tokens: any) {
    const userSession = {
      ...user,
      signedInAt: new Date().toISOString(),
      provider: 'google'
    };

    await storageService.saveUserSession(userSession);
    
    if (tokens.access_token) {
      await storageService.saveAuthToken(tokens.access_token);
    }
    
    if (tokens.refresh_token) {
      await storageService.saveRefreshToken(tokens.refresh_token);
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    try {
      // Nettoyer les données locales
      await storageService.clearUserSession();
      
      // Note: Pour une déconnexion complète, on pourrait également 
      // révoquer le token côté Google, mais ce n'est pas obligatoire
      // pour une déconnexion locale
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  async isSignedIn(): Promise<boolean> {
    try {
      const userSession = await storageService.getUserSession();
      return userSession !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère l'utilisateur actuel
   */
  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      return await storageService.getUserSession();
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifie et rafraîchit le token si nécessaire
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      const refreshToken = await storageService.getRefreshToken();
      
      if (!refreshToken) {
        return false;
      }

      // Ici on pourrait implémenter la logique de rafraîchissement
      // du token si on détecte qu'il a expiré
      
      return true;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  }
}

export const googleAuthService = GoogleAuthService.getInstance();