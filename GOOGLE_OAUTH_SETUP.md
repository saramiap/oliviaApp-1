# 🔑 Configuration Google OAuth pour Olivia APP

## 🚀 Mode Démo (Actuel)

Votre application fonctionne actuellement en **mode démo** qui ne nécessite aucune configuration Google OAuth. Vous pouvez utiliser toutes les fonctionnalités avec le bouton "🚀 Accès Démo Immédiat".

## 🔧 Activer Google OAuth (Optionnel)

Si vous souhaitez activer l'authentification Google réelle, suivez ces étapes :

### Étape 1 : Créer un projet Google Cloud

1. **Aller sur Google Cloud Console**
   - Visitez : https://console.cloud.google.com/
   - Connectez-vous avec votre compte Google

2. **Créer un nouveau projet**
   - Cliquez sur "Nouveau projet"
   - Nom : "Olivia APP" (ou votre choix)
   - Cliquez "Créer"

### Étape 2 : Configurer l'API OAuth

1. **Activer l'API Google+**
   - Menu → "APIs & Services" → "Library"
   - Rechercher "Google+ API"
   - Cliquer "Activer"

2. **Configurer l'écran de consentement**
   - Menu → "APIs & Services" → "OAuth consent screen"
   - Type d'utilisateur : "Externe"
   - Nom de l'application : "Olivia APP"
   - Email de support : votre email
   - Logo (optionnel)
   - Domaines autorisés : `localhost` (pour développement)
   - Sauvegarder

### Étape 3 : Créer les identifiants OAuth

1. **Créer un Client ID OAuth**
   - Menu → "APIs & Services" → "Credentials"
   - Cliquer "Create Credentials" → "OAuth client ID"
   - Type d'application : "Web application"
   - Nom : "Olivia APP Web Client"

2. **Configurer les URI autorisés**
   - **Origines JavaScript autorisées** :
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - **URI de redirection autorisés** :
     ```
     http://localhost:5173
     http://localhost:3000
     ```

3. **Récupérer le Client ID**
   - Copier le "Client ID" généré (format : `xxx.apps.googleusercontent.com`)

### Étape 4 : Configuration dans l'application

1. **Éditer le fichier .env**
   ```bash
   cd frontend
   nano .env  # ou votre éditeur préféré
   ```

2. **Ajouter le Client ID**
   ```env
   # Configuration Google OAuth
   VITE_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
   
   # Backend API URL
   VITE_API_URL=http://localhost:3000
   
   # Configuration optionnelle
   VITE_APP_NAME="Olivia APP"
   VITE_APP_VERSION=1.0.0
   ```

3. **Redémarrer l'application**
   ```bash
   # Arrêter les serveurs (Ctrl+C)
   # Puis relancer
   npm run dev
   ```

### Étape 5 : Tester l'authentification

1. **Accéder à l'application** : http://localhost:5173
2. **Page d'authentification** : Le bouton Google OAuth devrait apparaître
3. **Se connecter** : Cliquer sur "Continuer avec Google"
4. **Autoriser** : Accepter les permissions demandées

## 🔍 Dépannage Google OAuth

### Erreur : "OAuth client was not found"
- Vérifier que le Client ID est correct dans `.env`
- Vérifier que le projet Google Cloud est actif
- Redémarrer l'application après modification du `.env`

### Erreur : "Redirect URI mismatch"
- Vérifier que `http://localhost:5173` est dans les URI autorisés
- Vérifier que vous accédez à l'app via `localhost` et non `127.0.0.1`

### Erreur : "Access blocked"
- Vérifier que l'écran de consentement est configuré
- Ajouter votre email comme testeur si en mode "Testing"

### Le bouton Google n'apparaît pas
- Vérifier que `VITE_GOOGLE_CLIENT_ID` est défini dans `.env`
- Ouvrir la console browser (F12) pour voir les erreurs

## 🔄 Retour au mode démo

Pour revenir au mode démo, supprimez ou commentez la ligne dans `.env` :
```env
# VITE_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
```

## 🚀 Production

Pour déployer en production :

1. **Ajouter votre domaine de production** dans Google Cloud Console
   ```
   https://votre-domaine.com
   ```

2. **Mettre à jour le .env de production**
   ```env
   VITE_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
   VITE_API_URL=https://votre-api-domaine.com
   ```

3. **Publier l'écran de consentement** (passer de "Testing" à "In production")

---

**Note** : Le mode démo est parfait pour le développement et les tests. Google OAuth n'est nécessaire que si vous voulez une authentification réelle avec les comptes Google des utilisateurs.