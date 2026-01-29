import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  ToastAndroid,
} from 'react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
  Event,
  RepeatMode,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SURAH_NAMES = {
  1: 'Al-Fatiha',
  2: 'Al-Baqarah',
  36: 'Ya-Sin',
  55: 'Ar-Rahman',
  67: 'Al-Mulk',
};

const AudioPlayerScreen = ({ route, navigation }) => {
  // ✅ FIX 1: ID ko hamesha Number mein convert karein (parseInt)
  const [currentSurahId, setCurrentSurahId] = useState(
    parseInt(route.params.surah_ID),
  );
  const [currentSurahName, setCurrentSurahName] = useState(
    route.params.surahName,
  );

  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  // --- Load New Surah ---
  useEffect(() => {
    const loadNewSurah = async () => {
      setLoading(true);
      await setup(); // Player Ready karo
      await fetchAyats(currentSurahId); // Phir data lao

      // Name update
      if (SURAH_NAMES[currentSurahId]) {
        setCurrentSurahName(SURAH_NAMES[currentSurahId]);
      }
    };
    loadNewSurah();
  }, [currentSurahId]);

  // --- Track Listener ---
  useEffect(() => {
    const listener = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      event => {
        if (event.index !== undefined) setCurrentIndex(event.index);
      },
    );
    return () => listener.remove();
  }, []);

  // ✅ FIX 2: Setup Logic (Ab ye Error aane par Setup karega)
  const setup = async () => {
    try {
      // Check karo agar player pehle se bana hua hai
      await TrackPlayer.getActiveTrackIndex();
    } catch (error) {
      // ⚠️ Agar Error aya matlab Player bana nahi hai -> AB BANAO
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
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
        });
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
      } catch (setupError) {
        console.log('Setup Error:', setupError);
      }
    }
  };

  const fetchAyats = async id => {
    try {
      const url = 'http://10.27.239.234:8000/get_Surah_Ayats';
      const payload = { surah_ID: id, reciterid: 1 };

      console.log(`Fetching Surah ID: ${id}...`);
      const response = await axios.post(url, payload);

      if (response.data.data && response.data.data.length > 0) {
        setAyats(response.data.data);
        await addTracksToPlayer(response.data.data, id);
      } else {
        ToastAndroid.show('No Audio Found', ToastAndroid.SHORT);
        setLoading(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      setLoading(false);
    }
  };

  const addTracksToPlayer = async (ayatsList, id) => {
    try {
      await TrackPlayer.reset();
      const tracks = ayatsList.map((ayat, index) => ({
        id: `${index}`,
        url: ayat.audio,
        title: `Ayat ${ayat.AyatNumber || index + 1}`,
        artist: SURAH_NAMES[id] || `Surah ${id}`,
        artwork: 'https://cdn-icons-png.flaticon.com/512/3206/3206015.png',
      }));

      await TrackPlayer.add(tracks);
      await TrackPlayer.play();
      setLoading(false);
    } catch (error) {
      console.log('Add Track Error:', error);
      setLoading(false);
    }
  };

  // --- Next/Prev Surah Logic ---
  const loadNextSurah = () => {
    if (currentSurahId < 114) {
      setCurrentSurahId(prev => prev + 1);
    } else {
      ToastAndroid.show('Quran Completed!', ToastAndroid.SHORT);
    }
  };

  const loadPrevSurah = () => {
    if (currentSurahId > 1) {
      setCurrentSurahId(prev => prev - 1);
    }
  };

  // --- Button Handlers ---
  // --- ROBUST NEXT LOGIC ---
  const handleNextPress = async () => {
    try {
      // 1. Player se poocho: "Queue mein total kitni ayats hain?"
      const queue = await TrackPlayer.getQueue();
      // 2. Player se poocho: "Abhi hum kahan hain?"
      const currentTrackIdx = await TrackPlayer.getActiveTrackIndex();

      if (currentTrackIdx !== undefined && queue.length > 0) {
        // 3. Logic: Agar hum Aakhri Ayat (Last Index) par hain
        if (currentTrackIdx >= queue.length - 1) {
          console.log('End of Surah reached -> Loading Next Surah');
          loadNextSurah(); // 🚀 Next Surah Load karo
        } else {
          // Agar abhi ayats baqi hain -> Next Ayat par jao
          await TrackPlayer.skipToNext();
        }
      }
    } catch (error) {
      console.log('Next Error:', error);
    }
  };

  // --- ROBUST PREVIOUS LOGIC ---
  const handlePrevPress = async () => {
    try {
      const currentTrackIdx = await TrackPlayer.getActiveTrackIndex();

      if (currentTrackIdx !== undefined) {
        // Logic: Agar hum Pehli Ayat (Index 0) par hain
        if (currentTrackIdx === 0) {
          console.log('Start of Surah -> Loading Previous Surah');
          loadPrevSurah(); // 🔙 Previous Surah Load karo
        } else {
          await TrackPlayer.skipToPrevious();
        }
      }
    } catch (error) {
      console.log('Prev Error:', error);
    }
  };

  const togglePlayback = async () => {
    const state = playbackState.state || playbackState;
    if (state === State.Playing) await TrackPlayer.pause();
    else await TrackPlayer.play();
  };

  const getSliderValue = () => {
    if (!progress.duration) return currentIndex;
    return currentIndex + progress.position / progress.duration;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D3B33" />
        <Text style={{ marginTop: 10 }}>Loading Surah {currentSurahId}...</Text>
      </View>
    );
  }

  const isPlaying = (playbackState.state || playbackState) === State.Playing;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={30} color="#000" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.surahTitle}>
            {currentSurahName || `Surah ${currentSurahId}`}
          </Text>
          <Text style={styles.reciterName}>Mishary Al-Afasy</Text>
        </View>

        {/* Direct Next Surah Button */}
        <TouchableOpacity onPress={loadNextSurah}>
          <Ionicons
            name="play-skip-forward-circle-outline"
            size={30}
            color="#0D3B33"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.playerSection}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/4358/4358668.png',
          }}
          style={styles.artwork}
        />

        {/* PROGRESS */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={ayats.length}
            value={getSliderValue()}
            minimumTrackTintColor="#0D3B33"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#0D3B33"
            onSlidingComplete={async val =>
              await TrackPlayer.skip(Math.floor(val))
            }
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              Ayat: {ayats[currentIndex]?.AyatNumber || currentIndex + 1}
            </Text>
            <Text style={styles.timeText}>Total: {ayats.length}</Text>
          </View>
        </View>

        {/* CONTROLS */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePrevPress}>
            <Ionicons name="play-skip-back" size={35} color="#0D3B33" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNextPress}>
            <Ionicons name="play-skip-forward" size={35} color="#0D3B33" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AYAT LIST */}
      <View style={styles.listSection}>
        <FlatList
          data={ayats}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => {
            const isActive = index === currentIndex;
            return (
              <TouchableOpacity
                onPress={async () => {
                  await TrackPlayer.skip(index);
                  await TrackPlayer.play();
                }}
                style={[styles.ayatItem, isActive && styles.activeAyatItem]}
              >
                <View
                  style={[
                    styles.ayatNumberBox,
                    isActive && styles.activeNumberBox,
                  ]}
                >
                  <Text
                    style={[styles.ayatNumber, isActive && { color: '#fff' }]}
                  >
                    {item.AyatNumber || index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.arabicText}>{item.ArabicText}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  playerSection: { alignItems: 'center', padding: 10 },
  artwork: { width: 80, height: 80, marginBottom: 10 },
  surahTitle: { fontSize: 20, fontWeight: 'bold', color: '#0D3B33' },
  reciterName: { fontSize: 12, color: 'gray' },
  progressContainer: { width: '90%', marginVertical: 10 },
  slider: { width: '100%', height: 40 },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeText: { fontSize: 12, color: '#008000', fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  playButton: {
    backgroundColor: '#0D3B33',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  listSection: { flex: 1, padding: 15 },
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
  activeAyatItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#008000',
    borderWidth: 1.5,
  },
  activeNumberBox: { backgroundColor: '#008000' },
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
