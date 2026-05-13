// AudioPlayerScreen.js - COMPLETE FIXED VERSION

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useAudioPlayer } from '../AudioPlayer/useAudioPlayer';
import PlayerControls from '../AudioPlayer/PlayerControls';

export default function AudioPlayerScreen({ route }) {
  const playType = route.params?.type || 'surah';
  const playId =
    route.params?.chainId || route.params?.surah_ID || route.params?.id;
  const playTitle =
    route.params?.chainTitle || route.params?.surahName || 'Tilawat';

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
    seekToTime,
    isVoiceMode,
  } = useAudioPlayer(playType, playId, playTitle);

  const currentAyat = ayats[currentIndex];

  // Debug log
  if (currentAyat) {
    console.log('📖 Ayat Data:', {
      number: currentAyat.AyatNumber || currentAyat.ayatNumber,
      arabic: currentAyat.ArabicText || currentAyat.arabicText,
      urdu: currentAyat.urduText || currentAyat.UrduTranslation,
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F4037" />
        <Text style={styles.loadingText}>
          Loading {playType === 'chain' ? 'Chain' : 'Surah'}...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.topCard}>
        <View style={styles.headerInfo}>
          <Text style={styles.surahTitle}>{surahName}</Text>
          <Text style={styles.reciterName}>Mishary Rashid Al-Afasy</Text>

          {isVoiceMode && (
            <View style={styles.voiceBadge}>
              <Text style={styles.voiceBadgeText}>🎙️ Voice Command Mode</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.controlsWrapper}>
          <PlayerControls
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onNext={next}
            onPrevious={previous}
            onSeek={seekToTime}
          />
        </View>
      </View>

      <ScrollView
        style={styles.currentAyatContainer}
        contentContainerStyle={styles.ayatScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentAyat ? (
          <View style={styles.ayatBox}>
            <View style={styles.badgeContainer}>
              <Text style={styles.ayatBadge}>
                {playType === 'chain' && currentAyat.surahName
                  ? `${currentAyat.surahName} - Ayat ${
                      currentAyat.ayatNumber ?? currentIndex + 1
                    }`
                  : `Ayat ${
                      currentAyat.AyatNumber ||
                      currentAyat.ayatNumber ||
                      currentIndex + 1
                    }`}
              </Text>
            </View>

            {/* Arabic Text - RTL Support */}
            <Text style={styles.arabicText}>
              {currentAyat.ArabicText ||
                currentAyat.arabicText ||
                currentAyat.arabic ||
                '...'}
            </Text>

            <View style={styles.ayatDivider} />

            {/* Urdu Text - RTL Support */}
            <Text style={styles.urduText}>
              {currentAyat.urduText ||
                currentAyat.UrduTranslation ||
                currentAyat.translationUrdu ||
                currentAyat.translation ||
                'Translation not available'}
            </Text>
          </View>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.urduText}>Ayat Load Nahi Ho Saki</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
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
    fontWeight: '600',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerInfo: { alignItems: 'center', marginBottom: 15 },
  surahTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F4037',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  reciterName: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
    fontWeight: '500',
  },
  voiceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  voiceBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    width: 50,
    height: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 2,
    marginBottom: 20,
  },
  controlsWrapper: { width: '100%', paddingHorizontal: 10 },
  currentAyatContainer: { flex: 1, paddingHorizontal: 15 },
  ayatScrollContent: { paddingTop: 25, paddingBottom: 50 },
  ayatBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  badgeContainer: { alignItems: 'center', marginBottom: 25 },
  ayatBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F4037',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  arabicText: {
    fontSize: 32,
    lineHeight: 58,
    color: '#1F2937',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    marginBottom: 15,
    writingDirection: 'rtl',
  },
  ayatDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  urduText: {
    fontSize: 18,
    lineHeight: 32,
    color: '#4B5563',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontStyle: 'italic',
    writingDirection: 'rtl',
  },
  errorBox: { padding: 20, alignItems: 'center' },
});
