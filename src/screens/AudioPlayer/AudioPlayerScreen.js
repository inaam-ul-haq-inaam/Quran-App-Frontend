// AudioPlayerScreen.js
import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useAudioPlayer } from './useAudioPlayer';
import PlayerControls from './PlayerControls';
import AyatList from './AyatList';

export default function AudioPlayerScreen({ route }) {
  const {
    ayats,
    surahName,
    loading,
    currentIndex,
    isPlaying,
    play,
    pause,
    next,
    previous,
    seek,
  } = useAudioPlayer(route.params.surah_ID, route.params.surahName);

  // 1. Loading State Design
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F4037" />
        <Text style={styles.loadingText}>Loading Surah...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- TOP SECTION (Fixed Header & Controls) --- */}
      <View style={styles.topCard}>
        {/* Header Info */}
        <View style={styles.headerInfo}>
          <Text style={styles.surahTitle}>{surahName || 'Surah'}</Text>
          <Text style={styles.reciterName}>Mishary Rashid Al-Afasy</Text>
        </View>

        {/* Decoration / Divider */}
        <View style={styles.divider} />

        {/* Player Controls Component */}
        <View style={styles.controlsWrapper}>
          <PlayerControls
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onNext={next}
            onPrevious={previous}
          />
        </View>
      </View>

      {/* --- BOTTOM SECTION (Scrollable List) --- */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Ayat List</Text>
          <Text style={styles.totalAyats}>{ayats.length} Ayats</Text>
        </View>

        <AyatList ayats={ayats} currentIndex={currentIndex} onSelect={seek} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Very light grey background
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#1F4037',
    fontWeight: '500',
  },

  // Top Card (Shadow & Curves)
  topCard: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Shadow for Android
    elevation: 8,
    zIndex: 1,
  },

  // Header Typography
  headerInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  surahTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F4037', // Deep Islamic Green
    fontFamily: 'serif', // Elegant font
    letterSpacing: 0.5,
  },
  reciterName: {
    fontSize: 14,
    color: '#8E8E93', // Soft Grey
    marginTop: 5,
    fontWeight: '500',
  },

  // Divider Line
  divider: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },

  // Controls Wrapper (Spacing)
  controlsWrapper: {
    width: '100%',
    paddingHorizontal: 20,
  },

  // List Section
  listContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAyats: {
    fontSize: 12,
    color: '#1F4037',
    backgroundColor: '#E8F5E9', // Light green badge
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
