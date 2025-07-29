import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '@/types/chat';

interface ConversationHistorySidebarProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  onLoadConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export default function ConversationHistorySidebar({
  visible,
  onClose,
  conversations,
  onLoadConversation,
  onDeleteConversation,
  currentConversationId,
}: ConversationHistorySidebarProps) {
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short' 
      });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const handleDeleteConversation = (conversationId: string, title: string) => {
    Alert.alert(
      "Supprimer la conversation",
      `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => onDeleteConversation(conversationId)
        }
      ]
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const isActive = item.id === currentConversationId;
    
    return (
      <View style={[styles.conversationItem, isActive && styles.activeConversation]}>
        <TouchableOpacity
          style={styles.conversationContent}
          onPress={() => {
            onLoadConversation(item);
            onClose();
          }}
        >
          <Text style={[styles.conversationTitle, isActive && styles.activeText]}>
            {item.title}
          </Text>
          <Text style={[styles.conversationDate, isActive && styles.activeDateText]}>
            {formatDate(item.lastUpdated)}
          </Text>
          <Text style={[styles.messagePreview, isActive && styles.activeText]}>
            {item.messages.length} message{item.messages.length > 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteConversation(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backgroundTap} onPress={onClose} />
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <Text style={styles.title}>Historique des conversations</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          
          {conversations.length > 0 ? (
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id}
              style={styles.conversationsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyStateText}>
                Aucune conversation sauvegardée
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backgroundTap: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebar: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  activeConversation: {
    backgroundColor: '#E3F2FD',
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  activeText: {
    color: '#007AFF',
  },
  conversationDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  activeDateText: {
    color: '#0056B3',
  },
  messagePreview: {
    fontSize: 12,
    color: '#8E8E93',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
});