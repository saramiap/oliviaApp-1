# Phase 2 : Interface de Prévisualisation des Voyages Sonores

## Vue d'ensemble

La Phase 2 implémente une interface interactive complète pour les voyages sonores qui apparaît dans le chat quand Olivia propose un voyage sonore. Cette interface permet à l'utilisateur de prévisualiser et sélectionner des thèmes sonores de manière immersive.

## Fonctionnalités Implémentées

### 🎵 Interface SoundJourneyPreview
- **Titre et description** : "Voyages Sonores Disponibles" avec sous-titre explicatif
- **Carousel horizontal** : Affichage des 3 premiers thèmes recommandés
- **Sélection interactive** : Système de sélection avec indicateurs visuels
- **Informations détaillées** : Métadonnées, bénéfices et descriptions des thèmes sélectionnés
- **Boutons d'action** : "Aperçu (30s)" et "Immersion Complète"

### 🎨 Composant ThemeCarouselCard
- **Design immersif** : Image de fond avec overlay et gradient
- **Informations contextuelles** : Titre, description, durée, catégorie
- **Indicateurs visuels** : Icônes de catégorie, badges de durée, tags
- **États interactifs** : Sélection avec checkmark et bordure colorée
- **Responsive** : Optimisé pour différentes tailles d'écran

### 📊 Données Structurées
- **6 thèmes prédéfinis** : Forêt, Océan, Pluie, Feu de cheminée, Eau Zen, Méditation
- **Métadonnées complètes** : Durée, catégorie, difficulté, bénéfices, tags
- **Intégration assets** : Utilisation des images et audios existants
- **Fonctions utilitaires** : Formatage, filtrage, recherche par ID

## Structure des Fichiers

```
olivia-mobile/src/
├── components/
│   ├── contextual/                    # Nouveau dossier Phase 2
│   │   ├── SoundJourneyPreview.tsx    # Interface principale
│   │   ├── ThemeCarouselCard.tsx      # Carte de thème individuelle
│   │   └── index.ts                   # Exports des composants
│   ├── ContextualMessageBubble.tsx    # Modifié pour intégrer Phase 2
│   └── SimpleActionButton.tsx         # Créé pour les actions simples
├── data/
│   └── soundJourneyThemes.ts          # Données des thèmes
└── examples/
    └── SoundJourneyExample.tsx        # Exemple d'utilisation
```

## Utilisation

### Dans le Chat

Pour déclencher l'interface de prévisualisation des voyages sonores :

```typescript
import { createSoundJourneyMessage } from '@/examples/SoundJourneyExample';

// Créer un message contextuel
const message = createSoundJourneyMessage('forest'); // thème pré-sélectionné optionnel

// L'interface apparaîtra automatiquement dans ContextualMessageBubble
```

### Message Contextuel

```typescript
const soundJourneyMessage: ContextualChatMessage = {
  from: 'model',
  text: 'Je te propose un voyage sonore...',
  contextualAction: {
    type: 'VOYAGE_SONORE',
    contextType: 'immersive', // Interface Phase 2
    params: {
      themeId: 'forest' // Optionnel
    }
  }
};
```

### Actions Déclenchées

L'interface génère deux types d'actions :

```typescript
// Aperçu de 30 secondes
onAction('QUICK_PLAY_SOUND_JOURNEY', {
  themeId: 'forest',
  duration: 30,
  title: 'Forêt Apaisante'
});

// Immersion complète
onAction('NAVIGATE_FULL_SOUND_JOURNEY', {
  themeId: 'forest',
  duration: 1200,
  title: 'Forêt Apaisante'
});
```

## Design et Styles

### Palette de Couleurs
- **Primaire** : `Colors.primary[500]` (#0EA5E9)
- **Nature** : `Colors.nature[500]` (#22C55E)
- **Texte** : `Colors.text.primary` (#1F2937)
- **Arrière-plan** : `Colors.background.primary` (#FFFFFF)

### Composants Responsive
- **Cards** : 160x120px avec scroll horizontal
- **Espacement** : Utilisation de `Spacing` constants
- **Bordures** : `BorderRadius` pour cohérence
- **Ombres** : `Shadows.card` pour profondeur

### Optimisations
- **Images optimisées** : Mapping des assets React Native
- **Performance** : ScrollView horizontal optimisé
- **Accessibility** : Boutons avec feedback tactile
- **États** : Gestion des états disabled/enabled

## Tests

### Test de Base
1. Ouvrir `SoundJourneyExample.tsx`
2. L'interface devrait s'afficher avec 3 thèmes
3. Sélectionner un thème → informations détaillées apparaissent
4. Tester les boutons "Aperçu (30s)" et "Immersion Complète"

### Test d'Intégration
1. Dans le chat, créer un message avec `contextType: 'immersive'` et `type: 'VOYAGE_SONORE'`
2. L'interface complète devrait remplacer l'interface placeholder
3. Tester la sélection de thèmes et les actions

### Test de Performance
1. Scroll horizontal du carousel → fluide
2. Sélection de thèmes → instantanée
3. Affichage des images → pas de lag
4. Boutons → feedback immédiat

## Assets Requis

### Images (existantes)
- `foret.jpg` → Thème Forêt
- `la-mer.jpg` → Thème Océan  
- `pluie-relaxante.jpg` → Thème Pluie
- `relaxation.jpg` → Thème Feu de cheminée
- `patoger-dans-leau.jpg` → Thème Eau Zen
- `yoga.jpg` → Thème Méditation

### Audio (existants)
- `autumn-sky-meditation-7618.mp3`
- `ocean-beach-waves-332383.mp3`
- `gentle-rain-for-relaxation-and-sleep-337279.mp3`
- `feu-de-chemine.mp3`
- `nature-ambience-zen-eau-relaxe1.mp3`
- `relaxation-music-fond.mp3`

## Prochaines Étapes

### Phase 3 (Future)
- **Lecture audio intégrée** : Player dans l'interface
- **Personnalisation** : Création de thèmes personnalisés
- **Historique** : Sauvegarde des thèmes préférés
- **Analytics** : Suivi des préférences utilisateur

### Améliorations Possibles
- **Animations** : Transitions fluides entre états
- **Gestures** : Swipe pour naviguer dans le carousel
- **Feedback haptique** : Vibrations sur sélection
- **Mode sombre** : Support du dark mode

## Dépendances

- `@expo/vector-icons` - Icônes Ionicons
- `react-native` - Composants de base
- Types existants dans `@/types/chat`
- Constantes de design dans `@/constants`

---

**Status** : ✅ Phase 2 Complète - Prêt pour intégration et tests