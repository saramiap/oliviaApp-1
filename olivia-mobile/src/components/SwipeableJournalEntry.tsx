import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
}

interface SwipeableJournalEntryProps {
  entry: JournalEntry;
  onDelete: (entryId: string) => void;
  moods: Array<{ emoji: string; label: string }>;
}

export default function SwipeableJournalEntry({
  entry,
  onDelete,
  moods,
}: SwipeableJournalEntryProps) {
  const translateX = new Animated.Value(0);
  const [showDeleteButton, setShowDeleteButton] = React.useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSwipe = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      if (translationX < -50) {
        setShowDeleteButton(true);
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
        }).start();
      } else if (translationX > 50) {
        setShowDeleteButton(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
    
    if (state === State.END) {
      if (translationX < -100) {
        handleDelete();
      } else if (translationX < -50) {
        setShowDeleteButton(true);
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
        }).start();
      } else {
        setShowDeleteButton(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer l\'entrée',
      'Êtes-vous sûr de vouloir supprimer cette entrée ?',
      [
        { text: 'Annuler', style: 'cancel', onPress: resetPosition },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onDelete(entry.id);
            resetPosition();
          }
        }
      ]
    );
  };

  const resetPosition = () => {
    setShowDeleteButton(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleDirectDelete = () => {
    handleDelete();
  };

  return (
    <View style={styles.container}>
      {showDeleteButton && (
        <View style={styles.deleteBackground}>
          <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#FFFFFF" />
            <Text style={styles.deleteText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <PanGestureHandler
        onGestureEvent={handleSwipe}
        onHandlerStateChange={handleSwipe}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.entryCard,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.entryHeader}>
            <View style={styles.entryTitleContainer}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              {entry.mood && (
                <Text style={styles.entryMood}>
                  {moods.find(m => m.label === entry.mood)?.emoji || '💭'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleDirectDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
          <Text style={styles.entryContent} numberOfLines={3}>
            {entry.content}
          </Text>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  deleteAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  entryMood: {
    fontSize: 20,
  },
  entryDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
});