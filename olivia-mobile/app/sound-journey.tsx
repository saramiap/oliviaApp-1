import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { soundJourneyThemes, SoundJourneyTheme, AudioTrack } from '@/data/soundJourneyThemes';
import { storageService } from '@/services/storageService';

type PageState = 'theme_selection' | 'intro' | 'playing' | 'outro';

export default function SoundJourneyScreen() {
  const params = useLocalSearchParams();
  const [pageState, setPageState] = useState<PageState>('theme_selection');
  const [selectedTheme, setSelectedTheme] = useState<SoundJourneyTheme | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [soundObjects, setSoundObjects] = useState<Audio.Sound[]>([]);
  
  const audioObjectsRef = useRef<Audio.Sound[]>([]);

  useEffect(() => {
    // Configuration audio avec logging de debug
    const setupAudio = async () => {
      try {
        console.log('🎵 [DEBUG] Tentative de configuration audio...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ [DEBUG] Configuration audio réussie');
      } catch (error) {
        console.error('❌ [DEBUG] Erreur configuration audio:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        Alert.alert('Erreur Audio', `Problème de configuration: ${errorMessage}`);
      }
    };

    setupAudio();

    return () => {
      // Cleanup audio à la fermeture
      cleanupAudio();
    };
  }, []);

  // Gestion des paramètres de navigation depuis le chat
  useEffect(() => {
    if (params?.themeId && typeof params.themeId === 'string') {
      const theme = soundJourneyThemes.find(t => t.id === params.themeId);
      if (theme) {
        handleThemeSelect(theme);
        
        // Auto-play si demandé depuis le chat
        if (params?.autoPlay === 'true') {
          setTimeout(() => {
            if (theme.oliviaIntro) {
              setPageState('intro');
            } else {
              setPageState('playing');
              // Démarrer automatiquement la lecture
              setTimeout(() => {
                playAudio();
              }, 500);
            }
          }, 100);
        }
      }
    }
  }, [params?.themeId, params?.autoPlay]);

  const cleanupAudio = async () => {
    try {
      for (const sound of audioObjectsRef.current) {
        await sound.unloadAsync();
      }
      audioObjectsRef.current = [];
      setSoundObjects([]);
    } catch (error) {
      console.error('Erreur cleanup audio:', error);
    }
  };

  const setupTracks = async (tracks: AudioTrack[]) => {
    await cleanupAudio();
    
    try {
      console.log('🎵 [DEBUG] Setup tracks - Nombre de tracks:', tracks.length);
      const newSounds: Audio.Sound[] = [];
      
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        console.log(`🎵 [DEBUG] Track ${i}:`, {
          id: track.id,
          title: track.title,
          src: track.src,
          loop: track.loop,
          volume: track.volume
        });
        
        try {
          console.log(`🎵 [DEBUG] Création audio pour track ${track.id}...`);
          const { sound } = await Audio.Sound.createAsync(
            track.src,
            {
              shouldPlay: false,
              isLooping: track.loop || false,
              volume: isMuted ? 0 : (track.volume || 1),
            }
          );
          console.log(`✅ [DEBUG] Audio créé avec succès pour track ${track.id}`);
          newSounds.push(sound);
        } catch (trackError) {
          console.error(`❌ [DEBUG] Erreur création track ${track.id}:`, trackError);
          const errorMessage = trackError instanceof Error ? trackError.message : String(trackError);
          Alert.alert('Erreur Track', `Impossible de charger ${track.title}: ${errorMessage}`);
        }
      }
      
      console.log('🎵 [DEBUG] Total sounds créés:', newSounds.length);
      audioObjectsRef.current = newSounds;
      setSoundObjects(newSounds);
    } catch (error) {
      console.error('❌ [DEBUG] Erreur globale setup tracks:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Erreur', `Impossible de charger les pistes audio: ${errorMessage}`);
    }
  };

  const playAudio = async () => {
    console.log('🎵 [DEBUG] playAudio appelé');
    console.log('🎵 [DEBUG] Nombre de sounds disponibles:', audioObjectsRef.current.length);
    
    if (audioObjectsRef.current.length === 0) {
      console.log('❌ [DEBUG] Aucun sound disponible pour la lecture');
      Alert.alert('Erreur', 'Aucun fichier audio chargé');
      return;
    }
    
    try {
      console.log('🎵 [DEBUG] Début lecture audio...');
      setIsPlaying(true);
      
      for (let i = 0; i < audioObjectsRef.current.length; i++) {
        const sound = audioObjectsRef.current[i];
        const track = selectedTheme?.audioTracks[i];
        const delay = track?.delay || 0;
        
        console.log(`🎵 [DEBUG] Lecture track ${i} (${track?.title}) avec delay ${delay}ms`);
        
        if (delay > 0) {
          setTimeout(async () => {
            try {
              console.log(`🎵 [DEBUG] Lecture différée track ${i}`);
              await sound.playAsync();
              console.log(`✅ [DEBUG] Track ${i} en cours de lecture`);
            } catch (error) {
              console.error(`❌ [DEBUG] Erreur lecture différée track ${i}:`, error);
            }
          }, delay);
        } else {
          try {
            console.log(`🎵 [DEBUG] Lecture immédiate track ${i}`);
            await sound.playAsync();
            console.log(`✅ [DEBUG] Track ${i} en cours de lecture`);
          } catch (trackPlayError) {
            console.error(`❌ [DEBUG] Erreur lecture track ${i}:`, trackPlayError);
            const errorMessage = trackPlayError instanceof Error ? trackPlayError.message : String(trackPlayError);
            Alert.alert('Erreur Lecture', `Impossible de lire ${track?.title}: ${errorMessage}`);
          }
        }
      }
      console.log('✅ [DEBUG] Toutes les tracks lancées');
    } catch (error) {
      console.error('❌ [DEBUG] Erreur globale lecture audio:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Erreur Audio', `Erreur de lecture: ${errorMessage}`);
      setIsPlaying(false);
    }
  };

  const pauseAudio = async () => {
    try {
      for (const sound of audioObjectsRef.current) {
        await sound.pauseAsync();
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Erreur pause audio:', error);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await playAudio();
    }
  };

  const toggleMute = async () => {
    try {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      for (let i = 0; i < audioObjectsRef.current.length; i++) {
        const sound = audioObjectsRef.current[i];
        const track = selectedTheme?.audioTracks[i];
        const volume = newMutedState ? 0 : (track?.volume || 1);
        await sound.setVolumeAsync(volume);
      }
    } catch (error) {
      console.error('Erreur toggle mute:', error);
    }
  };

  const stopAndReset = async () => {
    try {
      for (const sound of audioObjectsRef.current) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Erreur stop audio:', error);
    }
  };

  const handleThemeSelect = async (theme: SoundJourneyTheme) => {
    if (isPlaying) {
      await stopAndReset();
    }
    
    setSelectedTheme(theme);
    await setupTracks(theme.audioTracks);
    
    // Sauvegarder l'activité
    try {
      await storageService.set('lastSoundJourneyActivity', {
        id: `sound_journey_${theme.id}`,
        type: 'Voyage Sonore',
        title: theme.title,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Erreur sauvegarde activité:', error);
    }
    
    if (theme.oliviaIntro) {
      setPageState('intro');
    } else {
      setPageState('playing');
    }
  };

  const startJourney = () => {
    setPageState('playing');
    if (!isPlaying) {
      playAudio();
    }
  };

  const finishJourney = async () => {
    if (isPlaying) {
      await pauseAudio();
    }
    
    if (selectedTheme?.oliviaOutro) {
      setPageState('outro');
    } else {
      resetToThemeSelection();
    }
  };

  const resetToThemeSelection = async () => {
    await stopAndReset();
    setSelectedTheme(null);
    setPageState('theme_selection');
  };

  const handleClose = async () => {
    await cleanupAudio();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/detente');
    }
  };

  const renderThemeSelection = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.themeSelectionHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
          <Text style={styles.backButtonText}>Retour à Détente</Text>
        </TouchableOpacity>
        
        <View style={styles.pageIconContainer}>
          <Ionicons name="musical-notes" size={48} color="#2196F3" />
        </View>
        <Text style={styles.pageTitle}>Choisissez votre Voyage Sonore</Text>
        <Text style={styles.pageSubtitle}>
          Plongez dans une ambiance sonore conçue pour votre bien-être.
        </Text>
      </View>

      <View style={styles.themesGrid}>
        {soundJourneyThemes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={styles.themeCard}
            onPress={() => handleThemeSelect(theme)}
          >
            <ImageBackground
              source={theme.backgroundImage}
              style={styles.themeCardImage}
              imageStyle={styles.themeCardImageStyle}
            >
              <View style={styles.themeCardOverlay}>
                <Text style={styles.themeCardTitle}>{theme.title}</Text>
                <Text style={styles.themeCardDescription}>{theme.description}</Text>
                <View style={styles.playIconContainer}>
                  <Ionicons name="play" size={24} color="#FFFFFF" />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderIntro = () => (
    <View style={styles.messageContainer}>
      <View style={styles.messageCard}>
        <Text style={styles.oliviaText}>{selectedTheme?.oliviaIntro}</Text>
        <View style={styles.messageActions}>
          <TouchableOpacity style={styles.primaryButton} onPress={startJourney}>
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Commencer le voyage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={resetToThemeSelection}>
            <Text style={styles.secondaryButtonText}>Choisir un autre thème</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderPlaying = () => (
    <View style={styles.playerContainer}>
      <TouchableOpacity style={styles.backPlayerButton} onPress={resetToThemeSelection}>
        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        <Text style={styles.backPlayerText}>Autres voyages</Text>
      </TouchableOpacity>
      
      <Text style={styles.currentThemeTitle}>{selectedTheme?.title}</Text>
      
      <View style={styles.playerControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={48} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMute}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={32} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.finishButton} onPress={finishJourney}>
        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
        <Text style={styles.finishButtonText}>Terminer et Réfléchir</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOutro = () => (
    <View style={styles.messageContainer}>
      <View style={styles.messageCard}>
        <View style={styles.outroIcon}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
        </View>
        <Text style={styles.outroTitle}>Voyage Terminé</Text>
        <Text style={styles.oliviaText}>{selectedTheme?.oliviaOutro}</Text>
        
        <View style={styles.outroActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              if (selectedTheme) {
                await setupTracks(selectedTheme.audioTracks);
                startJourney();
              }
            }}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Recommencer ce voyage</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={resetToThemeSelection}>
            <Text style={styles.secondaryButtonText}>Explorer d'autres voyages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={handleClose}>
            <Text style={styles.tertiaryButtonText}>Retour à l'Espace Détente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const getBackgroundStyle = () => {
    if (selectedTheme && pageState !== 'theme_selection') {
      return {
        ...styles.container,
        backgroundColor: 'rgba(0,0,0,0.3)',
      };
    }
    return styles.container;
  };

  return (
    <SafeAreaView style={getBackgroundStyle()}>
      <StatusBar style="light" />
      
      {selectedTheme && pageState !== 'theme_selection' && (
        <ImageBackground
          source={selectedTheme.backgroundImage}
          style={StyleSheet.absoluteFillObject}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.backgroundOverlay} />
        </ImageBackground>
      )}
      
      {pageState === 'theme_selection' && renderThemeSelection()}
      {pageState === 'intro' && renderIntro()}
      {pageState === 'playing' && renderPlaying()}
      {pageState === 'outro' && renderOutro()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundImageStyle: {
    opacity: 0.8,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  themeSelectionHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  themesGrid: {
    gap: 16,
    paddingBottom: 32,
  },
  themeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  themeCardImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  themeCardImageStyle: {
    borderRadius: 16,
  },
  themeCardOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  themeCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  themeCardDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  playIconContainer: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  messageCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  oliviaText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  messageActions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  tertiaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 40,
    gap: 8,
  },
  backPlayerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentThemeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    marginBottom: 40,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outroIcon: {
    marginBottom: 16,
  },
  outroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  outroActions: {
    width: '100%',
    gap: 12,
  },
});