import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress } from 'react-native-track-player';

export default function PlayerControls({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
}) {
  // 👇 Ye hook audio ka time aur duration live update karega
  const { position, duration } = useProgress();

  // Helper: Seconds ko 00:00 format mein convert karna
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* --- 1. SLIDER & TIME SECTION --- */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor="#1F4037" // Bhara hua hissa (Green)
          maximumTrackTintColor="#D3D3D3" // Khali hissa (Grey)
          thumbTintColor="#1F4037" // Pakadne wala gola
          onSlidingComplete={async value => {
            await TrackPlayer.seekTo(value); // Aagay peechay karne k liye
          }}
        />

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* --- 2. BUTTONS SECTION --- */}
      <View style={styles.controlsRow}>
        {/* Previous Button */}
        <TouchableOpacity onPress={onPrevious} style={styles.subButton}>
          <Ionicons name="play-skip-back" size={30} color="#1F4037" />
        </TouchableOpacity>

        {/* Play/Pause Button (Bara aur Green) */}
        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={styles.playButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={35}
            color="#FFFFFF"
            style={{ marginLeft: isPlaying ? 0 : 4 }} // Play icon ko center krne k liye
          />
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity onPress={onNext} style={styles.subButton}>
          <Ionicons name="play-skip-forward" size={30} color="#1F4037" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },

  // Progress Bar Styles
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: -5,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    fontVariant: ['tabular-nums'], // Numbers hilenge nahi
  },

  // Buttons Styles
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center mein layega
    gap: 40, // Buttons k darmiyan faasla
  },
  subButton: {
    padding: 10,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1F4037', // Deep Green Theme
    justifyContent: 'center',
    alignItems: 'center',
    // Shadows
    elevation: 8,
    shadowColor: '#1F4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
