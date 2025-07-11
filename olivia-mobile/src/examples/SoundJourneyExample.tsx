/**
 * Exemple d'utilisation de l'interface de prévisualisation des voyages sonores
 * Olivia Sérenis - Phase 2
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ContextualChatMessage } from '../types/chat';
import ContextualMessageBubble from '../components/ContextualMessageBubble';

export default function SoundJourneyExample() {
  // Exemple de message contextuel pour un voyage sonore
  const soundJourneyMessage: ContextualChatMessage = {
    from: 'model',
    text: 'Je te propose un voyage sonore pour t\'aider à te détendre. Choisis ton environnement préféré et laisse-toi transporter.',
    displayText: 'Je te propose un voyage sonore pour t\'aider à te détendre. Choisis ton environnement préféré et laisse-toi transporter.',
    id: 'msg_sound_journey_example',
    timestamp: Date.now(),
    contextualAction: {
      type: 'VOYAGE_SONORE',
      contextType: 'immersive', // Interface immersive Phase 2
      params: {
        themeId: 'forest', // Thème pré-sélectionné (optionnel)
      },
      metadata: {
        title: 'Voyages Sonores Disponibles',
        description: 'Découvrez nos environnements sonores apaisants',
        requiresConfirmation: false,
      }
    }
  };

  const handleAction = (actionName: string, params: any) => {
    console.log('Action déclenchée:', actionName, params);
    
    switch (actionName) {
      case 'QUICK_PLAY_SOUND_JOURNEY':
        console.log(`Aperçu de 30s pour le thème: ${params.themeId}`);
        // Ici on déclencherait la lecture de l'aperçu
        break;
        
      case 'NAVIGATE_FULL_SOUND_JOURNEY':
        console.log(`Navigation vers l'immersion complète: ${params.themeId}`);
        // Ici on naviguerait vers la page complète du voyage sonore
        break;
        
      default:
        console.log('Action non reconnue:', actionName);
    }
  };

  return (
    <View style={styles.container}>
      <ContextualMessageBubble
        message={soundJourneyMessage}
        onActionPress={handleAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
});

// Exemple d'utilisation dans le chat
export const createSoundJourneyMessage = (preselectedThemeId?: string): ContextualChatMessage => {
  return {
    from: 'model',
    text: 'Je te propose un voyage sonore pour t\'aider à te détendre.',
    displayText: 'Je te propose un voyage sonore pour t\'aider à te détendre.',
    id: `msg_sound_journey_${Date.now()}`,
    timestamp: Date.now(),
    contextualAction: {
      type: 'VOYAGE_SONORE',
      contextType: 'immersive',
      params: {
        themeId: preselectedThemeId,
      },
      metadata: {
        title: 'Voyages Sonores Disponibles',
        description: 'Choisissez votre environnement sonore',
        requiresConfirmation: false,
      }
    }
  };
};