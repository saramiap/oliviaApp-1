# 🧠 Olivia APP - Application de Thérapie Numérique

![Olivia Logo](frontend/public/LogoSerenisBig.png)

## 📋 Description

Olivia APP est une application de thérapie numérique complète qui propose un accompagnement psychologique via une intelligence artificielle (Olivia) développée avec Gemini AI. L'application offre diverses fonctionnalités de bien-être mental incluant des programmes anti-stress, des voyages sonores, un journal personnel, et bien plus.

## 🏗️ Architecture

- **Frontend** : React 19 + Vite + SCSS
- **Backend** : Express.js + Node.js
- **IA** : Gemini AI pour les conversations avec Olivia
- **Authentification** : Google OAuth (@react-oauth/google)
- **Stockage** : LocalStorage pour les données utilisateur

## 🚀 Lancement du Projet en Local

### Prérequis

- **Node.js** : Version 20.x ou supérieure
- **npm** : Version 10.x ou supérieure
- **Google Cloud Console** : Pour configurer OAuth (optionnel pour le développement)

### 🔧 Installation

#### 1. Cloner le repository
```bash
git clone [votre-repo-url]
cd oliviaApp
```

#### 2. Résoudre les problèmes de certificats NPM (si nécessaire)

Si vous rencontrez l'erreur `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, essayez une de ces solutions :

**Option A : Configuration temporaire NPM**
```bash
# Définir le registre NPM en HTTP (temporaire)
npm config set registry http://registry.npmjs.org/
npm config set strict-ssl false

# Après installation, remettre HTTPS
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl true
```

**Option B : Utilisation d'un proxy ou réseau différent**
```bash
# Essayer avec un autre réseau (mobile hotspot par exemple)
# ou configurer un proxy si nécessaire
```

**Option C : Nettoyage du cache NPM**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
```

#### 3. Installation Frontend
```bash
cd frontend
npm install
```

#### 4. Installation Backend
```bash
cd ../backend
npm install
```

### ⚙️ Configuration

#### Frontend Configuration

1. **Copier le fichier d'environnement**
```bash
cd frontend
cp .env.example .env
```

2. **Éditer le fichier .env**
```env
# Configuration Google OAuth (optionnel pour développement)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Backend API URL
VITE_API_URL=http://localhost:3000
```

#### Backend Configuration

1. **Créer le fichier .env dans backend/**
```bash
cd backend
touch .env
```

2. **Configurer les variables d'environnement**
```env
# Port du serveur
PORT=3000

# Clé API Gemini (obligatoire)
GEMINI_API_KEY=your-gemini-api-key

# Clé API Pixabay (optionnel)
PIXABAY_API_KEY=your-pixabay-api-key

# Environnement
NODE_ENV=development
```

### 🚀 Démarrage des Services

#### Démarrage en mode développement

**Terminal 1 : Backend**
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:3000`

**Terminal 2 : Frontend**
```bash
cd frontend
npm run dev
```
Le frontend démarre sur `http://localhost:5173`

#### Démarrage en mode production

**Build du frontend**
```bash
cd frontend
npm run build
```

**Démarrage du serveur complet**
```bash
cd backend
npm start
```
L'application complète sera disponible sur `http://localhost:3000`

### 🔑 Configuration Google OAuth (Optionnel)

Pour activer l'authentification Google complète :

1. **Créer un projet sur Google Cloud Console**
   - Aller sur https://console.cloud.google.com/
   - Créer un nouveau projet ou sélectionner un projet existant

2. **Activer l'API Google OAuth**
   - Aller dans "APIs & Services" > "Library"
   - Rechercher "Google+ API" et l'activer

3. **Créer des identifiants OAuth**
   - Aller dans "APIs & Services" > "Credentials"
   - Cliquer "Create Credentials" > "OAuth client ID"
   - Type d'application : "Web application"
   - Origines JavaScript autorisées : `http://localhost:5173`
   - URI de redirection : `http://localhost:5173`

4. **Copier le Client ID**
   - Copier le Client ID généré
   - L'ajouter dans `frontend/.env` comme `VITE_GOOGLE_CLIENT_ID`

### 📁 Structure du Projet

```
oliviaApp/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services (authentification, API)
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── utils/          # Utilitaires
│   │   ├── styles/         # Fichiers SCSS
│   │   └── data/           # Données statiques
│   ├── public/             # Assets statiques
│   └── package.json
├── backend/                 # Serveur Express
│   ├── server.js           # Point d'entrée du serveur
│   └── package.json
├── ARCHITECTURE_IMPROVEMENT_PLAN.md  # Plan d'amélioration technique
└── README.md               # Ce fichier
```

### 🎯 Fonctionnalités Principales

#### 🤖 Chat avec Olivia (IA)
- Conversations thérapeutiques avec Gemini AI
- Détection automatique des situations d'urgence
- Actions suggérées contextuelles (exercices, redirections)
- Synthèse vocale optionnelle

#### 🧘 Programmes de Bien-être
- **Programme Anti-Stress** : Exercices adaptatifs selon le niveau de stress
- **Voyages Sonores** : Ambiances relaxantes avec lecteur audio
- **Exercices de Respiration** : Techniques guidées (4-7-8, cohérence cardiaque)
- **Programme Yoga** : Sessions guidées

#### 📝 Journal Personnel
- Écriture libre et structurée
- Suivi d'humeur
- Préparation de séances thérapeutiques

#### 👤 Gestion Utilisateur
- Authentification Google OAuth
- Profils personnalisables
- Historique des activités
- Paramètres de confidentialité

### 🛠️ Scripts Disponibles

#### Frontend
```bash
npm run dev      # Démarrage en mode développement
npm run build    # Build de production
npm run preview  # Prévisualisation du build
npm run lint     # Linting du code
```

#### Backend
```bash
npm start        # Démarrage en production
npm run dev      # Démarrage avec nodemon
```

### 🔧 Dépannage

#### Problème : "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"
- Suivre les instructions dans la section Installation > Résoudre les problèmes de certificats NPM

#### Problème : "Cannot find module @react-oauth/google"
```bash
cd frontend
npm install @react-oauth/google
```

#### Problème : Variables d'environnement non trouvées
- Vérifier que les fichiers `.env` existent et contiennent les bonnes variables
- Redémarrer les serveurs après modification des `.env`

#### Problème : CORS errors
- Vérifier que le backend tourne sur le port 3000
- Vérifier la configuration proxy dans `vite.config.js`

### 📚 Technologies Utilisées

#### Frontend
- **React 19** : Framework UI
- **Vite** : Build tool et dev server
- **React Router** : Navigation
- **SCSS** : Styles modulaires
- **Lucide React** : Icônes
- **@react-oauth/google** : Authentification Google

#### Backend
- **Express.js** : Framework web
- **Node.js** : Runtime JavaScript
- **CORS** : Gestion des origines croisées
- **dotenv** : Variables d'environnement
- **node-fetch** : Requêtes HTTP (vers Gemini AI)

### 🔒 Sécurité et Confidentialité

- Authentification sécurisée via Google OAuth
- Stockage local des données sensibles
- Pas de transmission de données personnelles vers des tiers (sauf Google pour l'auth)
- Détection automatique des situations d'urgence avec redirection appropriée

### 📄 Licence

Ce projet est développé par Nayé Soumaré avec Gemini AI.

---

**Pour toute question ou problème, consulter la documentation technique dans `ARCHITECTURE_IMPROVEMENT_PLAN.md`**