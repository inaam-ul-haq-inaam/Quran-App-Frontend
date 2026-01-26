import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
  Event,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');

const AudioPlayerScreen = ({ route }) => {
  const { surah_ID, surahName } = route.params;
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track Player Hooks
  const playbackState = usePlaybackState();
  const progress = useProgress();

  useEffect(() => {
    // Sequence function: Pehle Setup, Phir Fetch
    const init = async () => {
      await setup(); // Step 1: Player Ready karo
      await fetchAyats(); // Step 2: Data mangwao
    };

    init();

    return () => {
      TrackPlayer.stop();
    };
  }, []);

  // --- 1. Player Setup (Robust) ---
  const setup = async () => {
    try {
      // Check agar player pehle se active hai
      await TrackPlayer.getActiveTrackIndex();
    } catch (error) {
      // Agar active nahi hai, to setup karo
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          stopWithApp: true,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
        });
      } catch (setupError) {
        console.log('Player Setup Warning:', setupError);
      }
    }
  };

  // --- 2. Fetch Data ---
  const fetchAyats = async () => {
    try {
      const url = 'http://192.168.30.150:8000/get_Surah_Ayats';

      // ✅ Payload with correct spelling & reciterID
      const payload = {
        surah_ID: surah_ID,
        reciterid: 1,
      };

      console.log('Fetching Ayats...');
      const response = await axios.post(url, payload);

      if (response.data.data) {
        setAyats(response.data.data);
        // Data aate hi Player mein daal dein
        await addTracksToPlayer(response.data.data);
      } else {
        Alert.alert('Error', 'No Ayats found');
      }
    } catch (error) {
      console.log('API Error:', error);
      Alert.alert('Error', 'Network request failed. Check IP.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Add to Player & Play ---
  const addTracksToPlayer = async ayatsList => {
    try {
      await TrackPlayer.reset();

      const tracks = ayatsList.map((ayat, index) => ({
        id: `${surah_ID}_${index}`,
        url: ayat.audio,
        title: `Ayat ${ayat.AyatNumber || index + 1}`,
        artist: ayat.reciterName || 'Mishary Al-Afasy',
        artwork: 'https://cdn-icons-png.flaticon.com/512/3206/3206015.png',
      }));

      console.log(`Adding ${tracks.length} tracks...`);
      await TrackPlayer.add(tracks);

      console.log('▶️ Auto Playing...');
      await TrackPlayer.play();
    } catch (error) {
      console.log('❌ Track Add Error:', error);
    }
  };

  // --- Helpers / Controls ---
  const togglePlayback = async () => {
    const currentTrack = await TrackPlayer.getActiveTrackIndex();
    if (currentTrack == null) return;

    if (playbackState.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => await TrackPlayer.skipToNext();
  const skipToPrevious = async () => await TrackPlayer.skipToPrevious();

  const playSpecificAyat = async index => {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D3B33" />
        <Text style={{ marginTop: 10 }}>Loading Surah {surahName}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- TOP: Player UI --- */}
      <View style={styles.playerSection}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/4358/4358668.png',
          }}
          style={styles.artwork}
        />
        <Text style={styles.surahTitle}>{surahName}</Text>
        <Text style={styles.reciterName}>Mishary Al-Afasy</Text>

        {/* Slider */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={progress.duration}
            value={progress.position}
            minimumTrackTintColor="#0D3B33"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#0D3B33"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
            <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons name="play-skip-back" size={35} color="#0D3B33" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
            <Ionicons
              // State handling adjusted for newer versions
              name={playbackState.state === State.Playing ? 'pause' : 'play'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipToNext}>
            <Ionicons name="play-skip-forward" size={35} color="#0D3B33" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- BOTTOM: Ayat List --- */}
      <View style={styles.listSection}>
        <Text style={styles.listHeader}>Ayats List</Text>
        <FlatList
          data={ayats}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => playSpecificAyat(index)}
              style={styles.ayatItem}
            >
              <View style={styles.ayatNumberBox}>
                <Text style={styles.ayatNumber}>
                  {item.AyatNumber || index + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.arabicText}>{item.ArabicText}</Text>
                {/* Agar English text available hai to show karein */}
                {item.englishText ? (
                  <Text
                    style={{ fontSize: 12, color: 'gray', textAlign: 'right' }}
                  >
                    {item.englishText}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Player Section
  playerSection: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  artwork: { width: 80, height: 80, marginBottom: 10 },
  surahTitle: { fontSize: 22, fontWeight: 'bold', color: '#0D3B33' },
  reciterName: { fontSize: 14, color: 'gray', marginBottom: 15 },

  // Slider
  progressContainer: { width: '100%', marginBottom: 10 },
  slider: { width: '100%', height: 40 },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeText: { fontSize: 12, color: '#555' },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    marginBottom: 5,
  },
  playButton: {
    backgroundColor: '#0D3B33',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  // List Section
  listSection: { flex: 1, padding: 20 },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ayatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  ayatNumberBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ayatNumber: { color: '#0D3B33', fontWeight: 'bold', fontSize: 12 },
  arabicText: {
    fontSize: 18,
    fontFamily: 'serif',
    color: '#000',
    textAlign: 'right',
  },
});

export default AudioPlayerScreen;
