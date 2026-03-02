import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TrackPlayer, { State } from 'react-native-track-player';

const BayanPlayer = ({ route, navigation }) => {
  const { bayanList, initialIndex } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const data = bayanList[currentIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const MOCK_DURATION = 1800;

  useEffect(() => {
    return () => {
      TrackPlayer.stop();
    };
  }, []);

  useEffect(() => {
    setupAndPlayBayan();
  }, [currentIndex]);

  useEffect(() => {
    let interval;
    if (isPlaying && hasAudio) {
      interval = setInterval(async () => {
        try {
          const progress = await TrackPlayer.getProgress();
          setPosition(progress.position || 0);
          setDuration(progress.duration || 0);
        } catch (e) {
          // Ignore
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasAudio]);

  // 🛠️ YEH FUNCTION UPDATE KIYA HAI
  const setupAndPlayBayan = async () => {
    setIsReady(false);

    try {
      // 1. 🚀 Sab se pehle check karein ke player INITIALIZE hai ya nahi
      try {
        await TrackPlayer.getPlaybackState();
        // Agar chal gaya to matlab initialized hai
      } catch (e) {
        // Agar error aaya to matlab initialize nahi hai, is liye isay on karein
        await TrackPlayer.setupPlayer();
      }

      const audioLink = data.AudioUrl || data.AudioFile;

      if (!audioLink || audioLink.trim() === '') {
        setHasAudio(false);
        setIsReady(true);
        return;
      }

      setHasAudio(true);
      await TrackPlayer.reset();

      await TrackPlayer.add({
        id: data.BayanID ? data.BayanID.toString() : '1',
        url: audioLink,
        title: data.Title || 'Unknown Title',
        artist: data.ScholarName || data.ScholorName || 'Dr Israr Ahmed',
      });

      await TrackPlayer.play();
      setIsPlaying(true);
      setIsReady(true);
    } catch (error) {
      console.error('Player Setup Error: ', error);
      setHasAudio(false);
      setIsReady(true);
    }
  };

  const togglePlayback = async () => {
    if (!hasAudio) return;
    try {
      const playbackObj = await TrackPlayer.getPlaybackState();
      if (playbackObj.state === State.Playing) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Playback toggle error:', e);
    }
  };

  const skipTime = async amount => {
    if (!hasAudio) return;
    try {
      const progress = await TrackPlayer.getProgress();
      const currentPos = progress.position;
      const currentDur = progress.duration;
      const newPos = currentPos + amount;

      await TrackPlayer.seekTo(Math.max(0, Math.min(newPos, currentDur)));
      setPosition(Math.max(0, Math.min(newPos, currentDur)));
    } catch (e) {
      console.error('Skip time error:', e);
    }
  };

  const playNext = () => {
    if (currentIndex < bayanList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayDuration = hasAudio
    ? duration > 0
      ? duration
      : 0
    : MOCK_DURATION;
  const displayPosition = hasAudio ? position : 0;
  const progressWidth =
    displayDuration > 0 ? (displayPosition / displayDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bayan</Text>
        <View style={{ width: 30 }} />
      </View>

      <View
        style={[
          styles.artContainer,
          !hasAudio && { backgroundColor: '#F3F4F6', shadowOpacity: 0 },
        ]}
      >
        <Ionicons
          name="mic"
          size={120}
          color={hasAudio ? '#00ADEF' : '#9CA3AF'}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{data.Title || 'Bayan Title'}</Text>
        <Text style={styles.ayatText}>
          {data.SurahName
            ? `${data.SurahName} (Ayat ${data.StartAyatID}-${data.EndAyatID})`
            : 'Topic Details'}
        </Text>
        <Text style={styles.speaker}>
          {data.ScholarName || data.ScholorName || 'Dr Israr Ahmed'}
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
          <Text style={styles.timeText}>{formatTime(displayPosition)}</Text>
          <Text style={styles.timeText}>{formatTime(displayDuration)}</Text>
        </View>
      </View>

      {isReady ? (
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={playPrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="play-skip-back"
              size={35}
              color={currentIndex === 0 ? '#D1D5DB' : '#333'}
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
              !hasAudio && { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
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
            onPress={playNext}
            disabled={currentIndex === bayanList.length - 1}
          >
            <Ionicons
              name="play-skip-forward"
              size={35}
              color={currentIndex === bayanList.length - 1 ? '#D1D5DB' : '#333'}
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
