import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Services et hooks
import { chatService } from '@/services/chatService';
import { storageService } from '@/services/storageService';
import useSpeech from '@/hooks/useSpeech';

// Types
import { ChatMessage, Conversation, ContextualChatMessage } from '@/types/chat';

// Composants
import OliviaAvatar from '@/components/OliviaAvatar';
import ContextualMessageBubble from '@/components/ContextualMessageBubble';
import ConversationHistorySidebar from '@/components/ConversationHistorySidebar';
import ActionButton from '@/components/ActionButton';

// Design
import Colors from '@/constants/Colors';
import { Spacing, Typography, BorderRadius, Shadows, Layout } from '@/constants/Design';

const EMERGENCY_KEYWORDS = [
  "suicide", "je veux mourir", "tuer", "plus envie de vivre", "violence",
  "je me fais mal", "je suis en danger", "j'ai besoin d'aide", "je vais mal",
  "pensées suicidaires", "on m'a agressé", "je me sens en insécurité",
];

export default function ChatScreen() {
  // États principaux
  const [messages, setMessages] = useState<ContextualChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isInActiveConversation, setIsInActiveConversation] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // États pour la gestion des retry
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Refs
  const isMountedRef = useRef(true);
  const flatListRef = useRef<FlatList>(null);

  // Hook pour la synthèse vocale
  const { speak, isSpeaking, cancelSpeech } = useSpeech();

  // Cleanup sur unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fonction de scroll simple
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // Scroll automatique vers les nouveaux messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]); // Trigger uniquement sur changement du nombre de messages

  // Chargement initial des données
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Charger l'historique des conversations
      const history = await storageService.getConversationHistory();
      setConversationHistory(history);

      // Charger les messages sauvegardés
      const savedMessages = await storageService.getChatMessages();
      let initialMessages: ContextualChatMessage[] = [];
      let conversationId: string | null = null;

      if (savedMessages.length > 0) {
        initialMessages = savedMessages.map((msg, index) => ({
          ...msg,
          ...chatService.parseActionTag(msg.text),
          id: msg.id || `msg_${Date.now()}_${index}`,
          timestamp: msg.timestamp || Date.now()
        }));

        // Trouver ou créer un ID pour cette conversation
        const title = chatService.generateConversationTitle(initialMessages);
        const existingConversation = history.find(conv => conv.title === title);
        conversationId = existingConversation ? existingConversation.id : Date.now().toString();
        setIsInActiveConversation(true);
      } else {
        // Message initial d'Olivia
        const initialText = "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd'hui.";
        const parsed = chatService.parseActionTag(initialText);
        initialMessages = [{
          from: "model",
          text: initialText,
          ...parsed,
          id: `msg_${Date.now()}_initial`,
          timestamp: Date.now()
        }];
        conversationId = Date.now().toString();
      }

      setCurrentConversationId(conversationId);
      setMessages(initialMessages);
      setIsInitialLoadComplete(true);
    } catch (error) {
      console.error('Erreur lors du chargement initial:', error);
      setIsInitialLoadComplete(true);
    }
  };

  // Sauvegarde automatique des messages
  useEffect(() => {
    if (isInitialLoadComplete && messages.length > 0) {
      const saveMessages = async () => {
        await storageService.saveChatMessages(messages);
        
        // Sauvegarder dans l'historique après un délai
        if (messages.length > 1) {
          setTimeout(() => {
            saveCurrentConversation();
          }, 1000);
        }
      };
      
      saveMessages();
    }
  }, [messages, isInitialLoadComplete]);

  // Gestion de la voix
  useEffect(() => {
    if (!voiceEnabled && isSpeaking) {
      cancelSpeech();
    }
  }, [voiceEnabled, isSpeaking, cancelSpeech]);

  const saveCurrentConversation = async () => {
    if (!currentConversationId || messages.length <= 0) return;

    const title = chatService.generateConversationTitle(messages);
    const conversationData: Conversation = {
      id: currentConversationId,
      title,
      messages: messages.map(({ from, text }) => ({ from, text })),
      lastUpdated: Date.now()
    };

    const currentHistory = [...conversationHistory];
    const existingIndex = currentHistory.findIndex(conv => conv.id === currentConversationId);
    
    if (existingIndex >= 0) {
      currentHistory[existingIndex] = conversationData;
    } else {
      currentHistory.unshift(conversationData);
    }

    const limitedHistory = currentHistory.slice(0, 50);
    setConversationHistory(limitedHistory);
    await storageService.saveConversationHistory(limitedHistory);
  };

  const createNewConversation = async () => {
    // Sauvegarder la conversation actuelle
    if (currentConversationId && messages.length > 0) {
      await saveCurrentConversation();
    }

    // Créer nouvelle conversation
    const newConversationId = Date.now().toString();
    const initialText = "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd'hui.";
    const parsed = chatService.parseActionTag(initialText);
    const newMessages: ContextualChatMessage[] = [{
      from: "model",
      text: initialText,
      ...parsed,
      id: `msg_${newConversationId}_initial`,
      timestamp: Date.now()
    }];
    
    setCurrentConversationId(newConversationId);
    setMessages(newMessages);
    setIsInActiveConversation(false);
    await storageService.saveChatMessages(newMessages);
  };

  const clearCurrentConversation = async () => {
    Alert.alert(
      "Supprimer la conversation",
      "Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            // Réinitialiser l'état
            const initialText = "Bonjour, je suis Olivia. Dis-moi ce que tu ressens aujourd'hui.";
            const parsed = chatService.parseActionTag(initialText);
            const timestamp = Date.now();
            const newMessages: ContextualChatMessage[] = [{
              from: "model",
              text: initialText,
              ...parsed,
              id: `msg_${timestamp}_reset`,
              timestamp: timestamp
            }];
            
            setMessages(newMessages);
            setCurrentConversationId(Date.now().toString());
            setIsInActiveConversation(false);
            await storageService.saveChatMessages(newMessages);
            
            setShowMenuModal(false);
          }
        }
      ]
    );
  };

  const restartConversation = async () => {
    Alert.alert(
      "Redémarrer la conversation",
      "Voulez-vous redémarrer la conversation avec Olivia ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Redémarrer",
          onPress: async () => {
            await createNewConversation();
            setShowMenuModal(false);
          }
        }
      ]
    );
  };

  const handleNewConversation = async () => {
    await createNewConversation();
    setShowMenuModal(false);
  };

  const handleAIResponse = async (aiReplyText: string) => {
    try {
      // Vérifier que le texte n'est pas vide
      if (!aiReplyText || typeof aiReplyText !== 'string' || aiReplyText.trim() === '') {
        console.warn('Message IA vide ou invalide détecté, ignoré');
        return;
      }

      const parsed = chatService.parseActionTag(aiReplyText);
      
      // Vérifier que le displayText n'est pas vide
      if (!parsed.displayText || parsed.displayText.trim() === '') {
        console.warn('DisplayText vide après parsing, message ignoré');
        return;
      }

      const contextualAction = chatService.parseContextualAction(parsed.actionName, parsed.params);
      const timestamp = Date.now();
      
      const aiMessage: ContextualChatMessage = {
        from: "model",
        text: aiReplyText,
        ...parsed,
        id: `msg_${timestamp}_ai`,
        timestamp: timestamp,
        contextualAction: contextualAction || undefined
      };

      // Vérifier si le composant est encore monté
      if (!isMountedRef.current) return;

      setMessages(prevMsgs => [...prevMsgs, aiMessage]);

      // Synthèse vocale
      if (voiceEnabled && !silentMode && parsed.displayText) {
        try {
          await speak(parsed.displayText);
        } catch (speechError) {
          console.warn('Erreur lors de la synthèse vocale:', speechError);
        }
      }

      // Actions automatiques
      if (parsed.actionName === "REDIRECT" && parsed.params?.path) {
        setTimeout(() => {
          if (isMountedRef.current && parsed.params?.path === "/urgence") {
            router.push("/urgence");
          }
        }, 700);
      }
    } catch (error) {
      console.error('Erreur dans handleAIResponse:', error);
      // S'assurer qu'un message d'erreur s'affiche même en cas d'exception
      if (isMountedRef.current) {
        const errorMessage: ContextualChatMessage = {
          from: "model",
          text: "Désolée, une erreur s'est produite lors du traitement de ma réponse.",
          displayText: "Désolée, une erreur s'est produite lors du traitement de ma réponse.",
          actionName: null,
          actionParams: {},
          id: `msg_${Date.now()}_error`,
          timestamp: Date.now()
        };
        setMessages(prevMsgs => [...prevMsgs, errorMessage]);
      }
      throw error; // Re-lancer l'erreur pour que le finally se déclenche
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (!isInActiveConversation) {
      setIsInActiveConversation(true);
    }

    const userMessageText = input;
    const timestamp = Date.now();
    
    // S'assurer que le message utilisateur n'est pas vide
    if (!userMessageText || userMessageText.trim() === '') {
      console.warn('Message utilisateur vide ignoré');
      return;
    }

    const userMessage: ContextualChatMessage = {
      from: "user",
      text: userMessageText,
      displayText: userMessageText,
      actionName: null,
      actionParams: {},
      id: `msg_${timestamp}_user`,
      timestamp: timestamp
    };

    // Préparer les messages pour l'API
    const messagesForAPI = [...messages, userMessage];

    // Mettre à jour l'UI
    setMessages(prevMsgs => [...prevMsgs, userMessage]);
    setInput("");

    if (silentMode) {
      setLoading(false);
      return;
    }

    // Vérifier les mots-clés d'urgence
    if (chatService.containsEmergencyKeyword(userMessageText.toLowerCase())) {
      const emergencyMsgText = `Je comprends ton inquiétude. Il est important de chercher de l'aide rapidement. Je te redirige vers nos ressources d'urgence. #REDIRECT{path:"/urgence"}`;
      await handleAIResponse(emergencyMsgText);
      
      Alert.alert(
        "Besoin d'aide immédiatement ?",
        "Tu n'es pas seul·e. Appelle le 3114 (numéro national de prévention du suicide, gratuit, 24/7).",
        [
          { text: "Fermer", style: "cancel" },
          { text: "Voir les ressources", onPress: () => router.push("/urgence") }
        ]
      );
      return;
    }

    // Réinitialiser les états de retry
    setRetryError(null);
    setRetryAttempt(0);
    setLoading(true);

    try {
      const response = await sendMessageWithRetryUI(messagesForAPI);
      
      // Protéger l'appel à handleAIResponse pour s'assurer que finally s'exécute
      try {
        await handleAIResponse(response);
      } catch (handleError) {
        console.error('Erreur dans handleAIResponse:', handleError);
        // Continuer avec le finally même si handleAIResponse échoue
      }
    } catch (error) {
      console.error('Erreur API Chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur technique inconnue';
      
      // Vérifier si le composant est encore monté avant de mettre à jour l'état
      if (isMountedRef.current) {
        setRetryError(errorMessage);
        
        try {
          await handleAIResponse(`Navrée, ${errorMessage}. Tu peux réessayer dans quelques instants.`);
        } catch (handleError) {
          console.error('Erreur lors de l\'affichage du message d\'erreur:', handleError);
        }
      }
    } finally {
      // S'assurer que les états sont remis à zéro même en cas d'erreur
      if (isMountedRef.current) {
        setLoading(false);
        setIsRetrying(false);
        setRetryAttempt(0);
      }
    }
  };

  /**
   * Envoie un message avec feedback visuel des retry
   */
  const sendMessageWithRetryUI = async (messagesForAPI: ContextualChatMessage[]): Promise<string> => {
    const maxAttempts = 2; // Configuration cohérente avec le chatService
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Mettre à jour l'état visuel seulement si le composant est monté
        if (attempt > 1 && isMountedRef.current) {
          setIsRetrying(true);
          setRetryAttempt(attempt);
        }

        // Si c'est un retry, attendre le délai avec indication visuelle
        if (attempt > 1) {
          const delayMs = 1500 * Math.pow(2, attempt - 2); // 1.5s, 3s
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        const response = await chatService.sendMessage(messagesForAPI);
        return response;

      } catch (error) {
        lastError = error;
        console.error(`Tentative ${attempt}/${maxAttempts} échouée:`, error);

        // Si c'est la dernière tentative, on lance l'erreur
        if (attempt === maxAttempts) {
          throw error;
        }

        // Mettre à jour l'état pour montrer qu'on va retry
        if (isMountedRef.current) {
          setRetryAttempt(attempt);
          setIsRetrying(true);
        }
      }
    }

    throw lastError || new Error('Erreur inconnue lors du retry');
  };

  const handleActionClick = (actionName: string, params: any) => {
    console.log("Action cliquée:", actionName, params);
    
    switch (actionName) {
      case "EXERCICE_RESPIRATION":
        router.push({
          pathname: "respiration",
          params: {
            type: params?.type,
            duration: params?.duree_sec?.toString(),
            cycles: params?.cycles?.toString(),
            autoStart: "true"
          }
        });
        break;
      case "VOYAGE_SONORE":
        router.push({
          pathname: "/sound-journey",
          params: {
            themeId: params?.themeId,
            autoPlay: "true"
          }
        });
        break;
      case "NAVIGATE_FULL_SOUND_JOURNEY":
        // Navigation vers l'interface complète de voyage sonore
        router.push({
          pathname: "/sound-journey",
          params: {
            themeId: params?.themeId,
            mode: "immersive"
          }
        });
        break;
      case "QUICK_PLAY_SOUND_JOURNEY":
        // Lecture rapide avec interface preview
        router.push({
          pathname: "/sound-journey",
          params: {
            themeId: params?.themeId,
            autoPlay: "true",
            quickMode: "true"
          }
        });
        break;
      case "SUGGESTION_JOURNAL":
        router.push("/journal");
        if (params?.prompt) {
          // Sauvegarder la suggestion pour la page Journal
          storageService.set('journalPromptSuggestion', params.prompt);
        }
        break;
      case "INFO_STRESS":
        router.push("/detente/comprendre-stress");
        break;
      default:
        console.warn("Action non reconnue:", actionName);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log('Tentative de suppression du message:', messageId);
    console.log('Messages actuels:', messages.map(m => ({ id: m.id, text: m.text.substring(0, 50) })));
    
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    console.log('Messages après filtrage:', updatedMessages.length);
    
    if (updatedMessages.length < messages.length) {
      setMessages(updatedMessages);
      
      // Sauvegarder immédiatement
      storageService.saveChatMessages(updatedMessages).then(() => {
        console.log('Messages sauvegardés après suppression');
      }).catch((error) => {
        console.error('Erreur lors de la sauvegarde après suppression:', error);
      });
    } else {
      console.warn('Aucun message supprimé, ID non trouvé:', messageId);
    }
  };

  const loadConversation = async (conversation: Conversation) => {
    // Sauvegarder la conversation actuelle avant de charger une nouvelle
    if (currentConversationId && messages.length > 0) {
      await saveCurrentConversation();
    }

    // Charger la conversation sélectionnée
    const loadedMessages = conversation.messages.map((msg, index) => ({
      ...msg,
      ...chatService.parseActionTag(msg.text),
      id: `msg_${conversation.id}_${index}`,
      timestamp: Date.now()
    }));

    setMessages(loadedMessages);
    setCurrentConversationId(conversation.id);
    setIsInActiveConversation(true);
    await storageService.saveChatMessages(loadedMessages);
  };

  const deleteConversation = async (conversationId: string) => {
    const updatedHistory = conversationHistory.filter(conv => conv.id !== conversationId);
    setConversationHistory(updatedHistory);
    await storageService.saveConversationHistory(updatedHistory);

    // Si c'est la conversation actuelle, créer une nouvelle conversation
    if (conversationId === currentConversationId) {
      await createNewConversation();
    }
  };

  const renderMessage = useCallback(({ item, index }: { item: ContextualChatMessage, index: number }) => {
    // DEBUG: Log des messages rendus
    console.log('[DEBUG] Rendu message:', {
      index,
      id: item.id,
      from: item.from,
      textLength: item.text?.length || 0,
      displayTextLength: item.displayText?.length || 0,
      hasText: !!item.text,
      hasDisplayText: !!item.displayText,
      isEmpty: (!item.text || item.text.trim() === '') && (!item.displayText || item.displayText.trim() === '')
    });

    // VALIDATION: Ne pas rendre les messages vides
    if ((!item.text || item.text.trim() === '') && (!item.displayText || item.displayText.trim() === '')) {
      console.warn('[DEBUG] Message vide détecté au rendu, ignoré:', item);
      return null;
    }

    return (
      <ContextualMessageBubble
        message={item}
        onActionPress={handleActionClick}
        onDelete={handleDeleteMessage}
        showDeleteOption={true}
      />
    );
  }, [handleActionClick, handleDeleteMessage]);

  // Fonction pour extraire les clés avec validation et prévention des doublons
  const keyExtractor = useCallback((item: ContextualChatMessage, index: number) => {
    // Utiliser l'ID unique du message directement, sans fallback basé sur l'index
    if (!item.id) {
      console.error('KeyExtractor - Message sans ID détecté');
      // Générer un ID unique basé sur le contenu et timestamp pour éviter les collisions
      const uniqueKey = `fallback_${item.from}_${item.timestamp || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return uniqueKey;
    }

    return item.id;
  }, []);

  // Filtrer les messages valides avant le rendu
  const validMessages = useMemo(() => {
    const filtered = messages.filter((msg) => {
      const hasText = msg?.text?.trim();
      const hasDisplayText = msg?.displayText?.trim();
      const hasId = msg?.id;
      return msg && (hasText || hasDisplayText) && hasId;
    });

    // Vérifier les doublons d'ID
    const ids = filtered.map(msg => msg.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.error('IDs dupliqués détectés:', duplicateIds);
    }

    return filtered;
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header avec Olivia */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistorySidebar(!showHistorySidebar)}
        >
          <Ionicons name="menu" size={24} color={Colors.primary[500]} />
        </TouchableOpacity>
        
        <OliviaAvatar isSpeaking={isSpeaking && voiceEnabled && !silentMode} />
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, voiceEnabled && styles.controlButtonActive]}
            onPress={() => setVoiceEnabled(!voiceEnabled)}
          >
            <Ionicons 
              name={voiceEnabled ? "volume-high" : "volume-mute"} 
              size={20} 
              color={voiceEnabled ? Colors.primary[500] : Colors.text.tertiary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, silentMode && styles.controlButtonActive]}
            onPress={() => setSilentMode(!silentMode)}
          >
            <Ionicons 
              name={silentMode ? "ear" : "chatbubble"} 
              size={20} 
              color={silentMode ? Colors.primary[500] : Colors.text.tertiary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowMenuModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={validMessages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          style={styles.messagesList}
          removeClippedSubviews={false}
          maxToRenderPerBatch={50}
          windowSize={50}
          initialNumToRender={50}
          onLayout={() => {
            // FlatList configurée pour rendre tous les messages
          }}
        />

        {/* Indicateur de chargement et retry */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={isRetrying ? Colors.warm[500] : Colors.primary[500]}
            />
            {isRetrying ? (
              <View style={styles.retryIndicator}>
                <Text style={styles.retryText}>
                  Tentative {retryAttempt}/2...
                </Text>
                <Text style={styles.retrySubText}>
                  Reconnexion en cours
                </Text>
              </View>
            ) : (
              <Text style={styles.loadingText}>Olivia réfléchit...</Text>
            )}
          </View>
        )}

        {/* Message d'erreur de retry */}
        {retryError && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color={Colors.warm[500]} />
            <Text style={styles.errorText}>
              {retryError}
            </Text>
          </View>
        )}

        {/* Zone de saisie */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Écris ton message ici..."
            placeholderTextColor={Colors.text.tertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!loading && !isRetrying}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading || isRetrying) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading || isRetrying}
          >
            <Ionicons
              name={isRetrying ? "refresh" : "send"}
              size={20}
              color={(!input.trim() || loading || isRetrying) ? Colors.text.tertiary : Colors.primary[500]}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Menu */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Options de conversation</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleNewConversation}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary[500]} />
              <Text style={styles.modalOptionText}>Nouvelle conversation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={restartConversation}
            >
              <Ionicons name="refresh" size={24} color={Colors.warm[500]} />
              <Text style={styles.modalOptionText}>Redémarrer cette conversation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={clearCurrentConversation}
            >
              <Ionicons name="trash" size={24} color={Colors.error} />
              <Text style={[styles.modalOptionText, { color: Colors.error }]}>Supprimer cette conversation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowMenuModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sidebar d'historique des conversations */}
      <ConversationHistorySidebar
        visible={showHistorySidebar}
        onClose={() => setShowHistorySidebar(false)}
        conversations={conversationHistory}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
        currentConversationId={currentConversationId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    height: Layout.header.height,
    ...Shadows.small,
  },
  historyButton: {
    padding: Spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  controlButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.tertiary,
  },
  controlButtonActive: {
    backgroundColor: Colors.primary[50],
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    fontSize: Typography.fontSize.sm,
  },
  retryIndicator: {
    alignItems: 'center',
  },
  retryText: {
    color: Colors.warm[600],
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
  },
  retrySubText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.warm[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warm[200],
    gap: Spacing.xs,
  },
  errorText: {
    color: Colors.warm[700],
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    fontSize: Typography.fontSize.md,
    backgroundColor: Colors.background.secondary,
    color: Colors.text.primary,
  },
  sendButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.background.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 300,
    ...Shadows.large,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  modalOptionText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    flex: 1,
  },
  modalCancel: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
});