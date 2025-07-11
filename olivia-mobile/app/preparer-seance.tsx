import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { chatService } from '@/services/chatService';
import { storageService } from '@/services/storageService';
import { ChatMessage } from '@/types/chat';
import MessageBubble from '@/components/MessageBubble';

interface Emotion {
  id: string;
  label: string;
  emoji: string;
}

const emotions: Emotion[] = [
  { id: 'heureux', label: 'Heureux·se', emoji: '😊' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
  { id: 'enerve', label: 'Énervé·e', emoji: '😠' },
  { id: 'anxieux', label: 'Anxieux·se', emoji: '😟' },
  { id: 'confus', label: 'Confus·e', emoji: '😕' },
  { id: 'reconnaissant', label: 'Reconnaissant·e', emoji: '🙏' },
  { id: 'fatigue', label: 'Fatigué·e', emoji: '😩' },
  { id: 'fier', label: 'Fier·e', emoji: '💪' },
];

export default function PreparerSeanceScreen() {
  const [currentTopic, setCurrentTopic] = useState('Sujet libre');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [structuredPoints, setStructuredPoints] = useState('');
  const [interactionHistory, setInteractionHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Message d'accueil initial d'Olivia
    const initialText = "Bonjour ! Cet espace est là pour t'aider à préparer ta prochaine séance. Sur quoi aimerais-tu te concentrer aujourd'hui ? Tu peux choisir une émotion ou commencer à écrire librement tes pensées et ressentis ci-dessous.";
    const parsed = chatService.parseActionTag(initialText);
    setInteractionHistory([{ 
      from: 'model', 
      text: initialText, 
      ...parsed,
      id: Math.random().toString(),
      timestamp: Date.now()
    }]);
  }, []);

  useEffect(() => {
    let topic = "Sujet libre";
    if (selectedEmotion) {
      topic = `Explorer : ${selectedEmotion.label}`;
      setSessionNotes(''); 
      setStructuredPoints('');
    }
    setCurrentTopic(topic);
  }, [selectedEmotion]);

  const handleEmotionClick = (emotion: Emotion) => {
    if (selectedEmotion?.id === emotion.id) {
      setSelectedEmotion(null);
    } else {
      setSelectedEmotion(emotion);
    }
  };

  const askOlivia = async (userText: string, contextMessages: ChatMessage[], specificPromptInstruction = ""): Promise<string> => {
    setIsLoadingAI(true);
    
    try {
      const messagesForAPI = contextMessages.map((msg) => ({
        from: msg.from === 'model' ? 'model' : 'user',
        text: msg.text,
      }));

      if (specificPromptInstruction) {
        messagesForAPI.push({
          from: 'user', 
          text: `${specificPromptInstruction}\nVoici ce que j'ai écrit :\n"${userText}"`
        });
      }

      const response = await chatService.sendMessage(messagesForAPI as any);
      return response;
    } catch (error) {
      console.error("Erreur API:", error);
      return `Oups, une difficulté technique de mon côté (${error instanceof Error ? error.message : 'Inconnue'}). Réessayons dans un instant.`;
    } finally {
      setIsLoadingAI(false);
    }
  };

  const sendChatMessageToAI = async () => {
    if (!userInput.trim()) return;
    
    const parsed = chatService.parseActionTag(userInput);
    const userMessage: ChatMessage = { 
      from: 'user', 
      text: userInput, 
      ...parsed,
      id: Math.random().toString(),
      timestamp: Date.now()
    };
    
    const newHistory = [...interactionHistory, userMessage];
    setInteractionHistory(newHistory);
    setUserInput('');

    const aiResponseText = await askOlivia(
      userInput, 
      newHistory, 
      "Continue d'aider l'utilisateur à explorer ses pensées pour sa séance. Pose des questions ouvertes ou propose des réflexions."
    );
    
    const parsedResponse = chatService.parseActionTag(aiResponseText);
    const aiMessage: ChatMessage = {
      from: 'model',
      text: aiResponseText,
      ...parsedResponse,
      id: Math.random().toString(),
      timestamp: Date.now()
    };
    
    setInteractionHistory(prev => [...prev, aiMessage]);
    
    // Scroll vers le bas après un nouveau message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleStructureNotes = async () => {
    if (!sessionNotes.trim()) {
      Alert.alert("Notes vides", "Veuillez d'abord écrire quelques notes à structurer.");
      return;
    }
    
    setIsLoadingAI(true);
    setStructuredPoints("Olivia est en train de structurer vos idées...");

    const messagesForStructuring = [
      ...interactionHistory,
      {
        from: 'user' as const,
        text: `Voici mes notes que j'aimerais structurer pour ma séance : "${sessionNotes}"`,
        id: Math.random().toString(),
        timestamp: Date.now()
      }
    ];

    const structuringInstruction = "IMPORTANT: Analyse les notes suivantes de l'utilisateur et aide-le à les structurer en 3 à 5 points clés clairs et concis qu'il pourrait aborder lors de sa prochaine séance avec son thérapeute. Présente ces points sous forme de liste à puces.";

    const aiResponseText = await askOlivia(sessionNotes, messagesForStructuring, structuringInstruction);
    setStructuredPoints(aiResponseText);
  };

  const formatAIResponseForDisplay = (text: string) => {
    if (!text) return null;
    return text
      .split(/\n+/)
      .filter((p) => p.trim() !== "")
      .map((p, i) => {
        const isListItem = /^\s*(?:•|\*|-|\d+\.)\s+/.test(p);
        const cleanText = p.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
        return (
          <Text key={i} style={isListItem ? styles.listItem : styles.normalText}>
            {cleanText}
          </Text>
        );
      });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Préparer ma séance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section émotions */}
        <View style={styles.emotionsSection}>
          <Text style={styles.sectionTitle}>Explorer une émotion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emotionsContainer}>
            {emotions.map((emotion) => (
              <TouchableOpacity
                key={emotion.id}
                style={[
                  styles.emotionButton,
                  selectedEmotion?.id === emotion.id && styles.emotionButtonSelected
                ]}
                onPress={() => handleEmotionClick(emotion)}
              >
                <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                <Text style={styles.emotionLabel}>{emotion.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.emotionButton,
                !selectedEmotion && styles.emotionButtonSelected
              ]}
              onPress={() => setSelectedEmotion(null)}
            >
              <Text style={styles.emotionEmoji}>💬</Text>
              <Text style={styles.emotionLabel}>Sujet libre</Text>
            </TouchableOpacity>
          </ScrollView>
          <Text style={styles.emotionsTip}>
            💡 Sélectionner une émotion peut aider Olivia à mieux cibler ses questions.
          </Text>
        </View>

        {/* Focus actuel */}
        <View style={styles.focusSection}>
          <Text style={styles.focusText}>Focus actuel : {currentTopic}</Text>
        </View>

        {/* Notes de séance */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Mes notes pour la séance</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Décris ce qui t'est arrivé, tes ressentis, tes questions..."
            value={sessionNotes}
            onChangeText={setSessionNotes}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={[styles.structureButton, (!sessionNotes.trim() || isLoadingAI) && styles.structureButtonDisabled]}
            onPress={handleStructureNotes}
            disabled={!sessionNotes.trim() || isLoadingAI}
          >
            <Ionicons name="bulb" size={18} color="#FFFFFF" />
            <Text style={styles.structureButtonText}>Olivia, aide-moi à structurer mes idées</Text>
          </TouchableOpacity>
        </View>

        {/* Points structurés */}
        {structuredPoints && (
          <View style={styles.structuredSection}>
            <Text style={styles.sectionTitle}>Points clés suggérés par Olivia :</Text>
            <View style={styles.structuredContent}>
              {formatAIResponseForDisplay(structuredPoints)}
            </View>
            <Text style={styles.structuredTip}>
              💡 Utilise ces points comme base de discussion avec ton thérapeute.
            </Text>
          </View>
        )}

        {/* Chat avec Olivia */}
        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>Besoin d'explorer davantage avec Olivia ?</Text>
          
          <View style={styles.chatContainer}>
            <FlatList
              ref={flatListRef}
              data={interactionHistory}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id || Math.random().toString()}
              style={styles.messagesList}
              scrollEnabled={false}
            />
            
            {isLoadingAI && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Olivia réfléchit...</Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder={selectedEmotion ? `Discuter de "${selectedEmotion.label}"...` : "Pose une question à Olivia..."}
              value={userInput}
              onChangeText={setUserInput}
              multiline
              maxHeight={100}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!userInput.trim() || isLoadingAI) && styles.sendButtonDisabled]}
              onPress={sendChatMessageToAI}
              disabled={!userInput.trim() || isLoadingAI}
            >
              <Ionicons name="send" size={20} color={(!userInput.trim() || isLoadingAI) ? "#8E8E93" : "#007AFF"} />
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emotionsSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  emotionsContainer: {
    marginBottom: 12,
  },
  emotionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 80,
  },
  emotionButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emotionsTip: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  focusSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  focusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  structureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  structureButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  structureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  structuredSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  structuredContent: {
    marginVertical: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 4,
  },
  normalText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 8,
  },
  structuredTip: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  chatSection: {
    marginBottom: 32,
  },
  chatContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  messagesList: {
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  sendButtonDisabled: {
    backgroundColor: '#F2F2F7',
  },
});