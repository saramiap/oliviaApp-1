# ⚡ Guide d'Intégration Rapide - Interfaces Contextuelles

## 🎯 Démarrage en 10 Minutes

### 1. Comprendre les Bases (2 min)

Le système d'interfaces contextuelles remplace les boutons simples par des expériences interactives :

```typescript
// AVANT : Bouton simple
<TouchableOpacity onPress={() => navigate('/respiration')}>
  <Text>Exercice de respiration</Text>
</TouchableOpacity>

// APRÈS : Interface contextuelle immersive
<ContextualMessageBubble
  message={{
    text: "Choisissons un exercice de respiration ensemble",
    contextualAction: {
      type: 'EXERCICE_RESPIRATION',
      contextType: 'immersive',
      params: { exerciseId: 'box_breathing' }
    }
  }}
  onActionPress={handleAction}
/>
```

### 2. Tester le Système (3 min)

1. **Ouvrir** `/test-contextual` dans l'app
2. **Explorer** les 5 types d'interfaces disponibles
3. **Interagir** avec les carousels et boutons
4. **Observer** les paramètres dans les alertes

### 3. Votre Premier Message Contextuel (5 min)

```typescript
// 1. Créer le message avec action contextuelle
const messageAvecInterface: ContextualChatMessage = {
  id: 'msg_1',
  from: 'model',
  text: 'Voulez-vous faire un exercice de respiration ?',
  contextualAction: {
    type: 'EXERCICE_RESPIRATION',           // ← Type d'action
    contextType: 'preview',                 // ← Type d'interface
    params: { 
      duration: 300,                        // ← Paramètres spécifiques
      cycles: 10 
    },
    metadata: {
      title: 'Respiration 4-7-8',           // ← Métadonnées affichage
      description: 'Exercice relaxant de 5 minutes'
    }
  }
};

// 2. Gérer l'action utilisateur
const handleActionPress = (actionName: string, params: any) => {
  if (actionName === 'EXERCICE_RESPIRATION') {
    router.push(`/respiration?duration=${params.duration}&cycles=${params.cycles}`);
  }
};

// 3. Afficher dans le chat
<ContextualMessageBubble
  message={messageAvecInterface}
  onActionPress={handleActionPress}
/>
```

---

## 🔧 Intégration dans le Chat Existant

### Modifier Votre Composant Chat

```typescript
// Dans votre composant Chat principal
import ContextualMessageBubble from '@/components/ContextualMessageBubble';

// Remplacer MessageBubble standard par ContextualMessageBubble
const renderMessage = (message: ChatMessage) => {
  // Le ContextualMessageBubble gère automatiquement les deux types
  return (
    <ContextualMessageBubble
      key={message.id}
      message={message}                     // ← Message standard ou contextuel
      onActionPress={handleActionPress}     // ← Votre handler d'actions
    />
  );
};
```

### Adapter Vos Messages Backend

```typescript
// Côté backend : ajouter contextualAction aux réponses
const response = {
  text: "Je vous propose un voyage sonore relaxant",
  contextualAction: {
    type: 'VOYAGE_SONORE',
    contextType: 'immersive',
    params: { themeId: 'ocean' },
    metadata: {
      title: 'Voyage Sonore - Océan',
      description: 'Sons d\'océan pour relaxation profonde'
    }
  }
};
```

---

## 📋 Types d'Interfaces Disponibles

### 🔘 Simple - Bouton d'Action
**Usage** : Redirections, liens, actions rapides
```typescript
contextType: 'simple'
// Affiche : Bouton avec icône + titre
```

### 📱 Preview - Aperçu avec Métadonnées  
**Usage** : Aperçus avant action, informations détaillées
```typescript
contextType: 'preview'
// Affiche : Titre + description + données + bouton action
```

### 🎪 Immersive - Interface Interactive
**Usage** : Sélections complexes, configuration d'exercices
```typescript
contextType: 'immersive'
// Affiche : Interface complète spécialisée (carousel, options, etc.)
```

---

## 🎨 Actions Pré-configurées

### Voyage Sonore
```typescript
type: 'VOYAGE_SONORE'
params: { themeId: 'forest|ocean|rain|fire|mountain' }
// → Interface avec sélection de thèmes
```

### Exercice de Respiration  
```typescript
type: 'EXERCICE_RESPIRATION'
params: { exerciseId: 'box_breathing|4_7_8|coherence', duration: 300, cycles: 10 }
// → Interface avec sélection d'exercices et configuration
```

### Suggestion de Journal
```typescript
type: 'SUGGESTION_JOURNAL'
params: { promptId: 'gratitude|reflection|emotions', question: 'Question...' }
// → Interface avec prompts de réflexion
```

### Information/Redirection
```typescript
type: 'INFO_STRESS' | 'REDIRECT'
params: { sujet: 'topic', path: '/page' }
// → Bouton simple vers contenu ou page
```

---

## ✅ Checklist d'Intégration

### ✅ Étapes Techniques
- [ ] `ContextualMessageBubble` importé dans votre chat
- [ ] Handler `onActionPress` implémenté avec navigation
- [ ] Types TypeScript `ContextualChatMessage` utilisés
- [ ] Messages backend adaptés avec `contextualAction`

### ✅ Tests Essentiels
- [ ] Page `/test-contextual` accessible et fonctionnelle
- [ ] Au moins 1 interface de chaque type testée
- [ ] Navigation depuis interfaces vers pages app
- [ ] Performance fluide sur appareils mobiles

### ✅ UX et Design
- [ ] Interfaces cohérentes avec design system app
- [ ] Transitions fluides entre sélections
- [ ] États désactivés/chargement gérés
- [ ] Textes lisibles et accessibles

---

## 🚨 Problèmes Courants et Solutions

### Interface ne s'affiche pas
```typescript
// ❌ Problème : contextualAction manquante
const message = { text: "Message" }; // Pas d'interface

// ✅ Solution : Ajouter contextualAction
const message = { 
  text: "Message",
  contextualAction: { /* ... */ }
};
```

### Actions ne fonctionnent pas
```typescript
// ❌ Problème : onActionPress non défini
<ContextualMessageBubble message={message} />

// ✅ Solution : Ajouter handler
<ContextualMessageBubble 
  message={message} 
  onActionPress={(action, params) => {
    console.log('Action:', action, params);
    // Votre logique de navigation
  }} 
/>
```

### Paramètres incorrects
```typescript
// ❌ Problème : Paramètres manquants
params: {}

// ✅ Solution : Vérifier paramètres requis
params: { 
  themeId: 'ocean',      // Requis pour VOYAGE_SONORE
  duration: 300,         // Requis pour EXERCICE_RESPIRATION
  exerciseId: 'box_breathing'
}
```

---

## 📞 Support et Ressources

### 📚 Documentation Complète
- [`DOCUMENTATION_INTERFACES_CONTEXTUELLES.md`](DOCUMENTATION_INTERFACES_CONTEXTUELLES.md) - Documentation technique complète
- [`/test-contextual`](app/test-contextual.tsx) - Page de test interactive
- [`src/types/chat.ts`](src/types/chat.ts) - Types TypeScript

### 🔧 Composants Clés
- [`ContextualMessageBubble.tsx`](src/components/ContextualMessageBubble.tsx) - Orchestrateur principal
- [`SoundJourneyPreview.tsx`](src/components/contextual/SoundJourneyPreview.tsx) - Interface voyages sonores
- [`BreathingPreview.tsx`](src/components/contextual/BreathingPreview.tsx) - Interface respiration
- [`JournalPreview.tsx`](src/components/contextual/JournalPreview.tsx) - Interface journal

### 💡 Exemples d'Utilisation
Voir les exemples complets dans [`test-contextual.tsx`](app/test-contextual.tsx) lignes 29-186

---

**🎉 Vous êtes prêt ! Le système d'interfaces contextuelles va transformer l'expérience utilisateur de votre app Olivia.**