// BayanPlayer.js - Fixed with debug logs

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBayanController } from './BayanController'; // ✅ Correct import (check file name)

const formatTime = seconds => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const BayanPlayer = ({ route, navigation }) => {
  const {
    bayanList,
    initialIndex = 0,
    isVoiceCommand = false,
  } = route.params || {};

  // Debug logs to verify received data
  console.log('🎵 BayanPlayer received:', {
    bayanListLength: bayanList?.length,
    initialIndex,
    isVoiceCommand,
    firstTitle: bayanList?.[0]?.Title,
    targetIndexTitle: bayanList?.[initialIndex]?.Title,
    targetAudioUrl: bayanList?.[initialIndex]?.AudioUrl,
  });

  const {
    data,
    currentIndex,
    isPlaying,
    isReady,
    hasAudio,
    position,
    duration,
    togglePlayback,
    skipTime,
    playNext,
    playPrevious,
    isVoiceMode,
  } = useBayanController(bayanList, initialIndex, isVoiceCommand);

  // Log current playing data
  console.log('🎵 BayanPlayer playing:', {
    currentIndex,
    title: data?.Title,
    audioUrl: data?.AudioUrl,
  });

  const progressWidth = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bayan</Text>
        {isVoiceMode && (
          <View style={styles.voiceBadge}>
            <Text style={styles.voiceBadgeText}>🎙️ Voice</Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.artContainer,
          !hasAudio && { backgroundColor: '#F3F4F6' },
        ]}
      >
        <Ionicons
          name="mic"
          size={120}
          color={hasAudio ? '#00ADEF' : '#9CA3AF'}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{data?.Title || 'Bayan Title'}</Text>
        <Text style={styles.ayatText}>
          {data?.SurahName
            ? `${data.SurahName} (Ayat ${data.StartAyatID}-${data.EndAyatID})`
            : 'Topic Details'}
        </Text>
        <Text style={styles.speaker}>
          {data?.ScholarName || data?.ScholorName || 'Dr Israr Ahmed'}
        </Text>
        {!hasAudio && (
          <Text style={styles.noAudioText}>Audio file not available</Text>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressWidth}%`,
                backgroundColor: hasAudio ? '#00ADEF' : '#9CA3AF',
              },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {isReady ? (
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => playPrevious(false)}
            disabled={currentIndex === 0 && !isVoiceMode}
          >
            <Ionicons
              name="play-skip-back"
              size={35}
              color={currentIndex === 0 && !isVoiceMode ? '#D1D5DB' : '#333'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => skipTime(-15)}
            activeOpacity={hasAudio ? 0.2 : 1}
          >
            <Ionicons
              name="play-back"
              size={35}
              color={hasAudio ? '#333' : '#9CA3AF'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePlayback}
            activeOpacity={hasAudio ? 0.2 : 1}
            style={[
              styles.playButton,
              !hasAudio && { backgroundColor: '#9CA3AF' },
            ]}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="white"
              style={{ marginLeft: isPlaying ? 0 : 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => skipTime(15)}
            activeOpacity={hasAudio ? 0.2 : 1}
          >
            <Ionicons
              name="play-forward"
              size={35}
              color={hasAudio ? '#333' : '#9CA3AF'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => playNext(false)}
            disabled={
              currentIndex === (bayanList?.length || 1) - 1 && !isVoiceMode
            }
          >
            <Ionicons
              name="play-skip-forward"
              size={35}
              color={
                currentIndex === (bayanList?.length || 1) - 1 && !isVoiceMode
                  ? '#D1D5DB'
                  : '#333'
              }
            />
          </TouchableOpacity>
        </View>
      ) : (
        <ActivityIndicator
          size="large"
          color="#00ADEF"
          style={{ marginTop: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voiceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  voiceBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  artContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 30,
    backgroundColor: '#E5F6FD',
    width: 220,
    height: 220,
    borderRadius: 110,
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#00ADEF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  infoContainer: { alignItems: 'center', paddingHorizontal: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  ayatText: {
    fontSize: 16,
    color: '#008000',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  speaker: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  noAudioText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 12,
    fontWeight: 'bold',
  },
  progressContainer: { marginTop: 40, paddingHorizontal: 30 },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 40,
    marginBottom: 20,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00ADEF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#00ADEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default BayanPlayer;
