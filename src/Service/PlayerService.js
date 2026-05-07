import TrackPlayer, {
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Private State (Variables) ---
let isSetup = false;
let currentSurahId = 1;
let currentBayanId = 1;
let callback = null;
let currentPlaylist = []; // 🆕 Store current playlist
let currentPlaylistType = 'surah'; // 🆕 'surah' or 'bayan' or 'chain'
let isVoiceModeActive = false; // 🆕 Track if current operation is from voice

// --- Helper Functions ---

const registerCallback = cb => {
  callback = cb;
};

const setSurahID = id => {
  currentSurahId = parseInt(id) || 1;
};

const setBayanID = id => {
  currentBayanId = parseInt(id) || 1;
  console.log('✅ PlayerService: Bayan ID set to', currentBayanId);
};

const setVoiceMode = isVoice => {
  isVoiceModeActive = isVoice;
  console.log('🎙️ Voice mode:', isVoice);
};

const setupPlayer = async () => {
  if (isSetup) return;
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });
    isSetup = true;
  } catch (e) {
    isSetup = true;
  }
};

const play = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    const state = await TrackPlayer.getState();
    console.log('🔍 Current State before play:', state);
    await TrackPlayer.play();

    if (callback) {
      callback(currentSurahId, true, 'surah', isVoice);
    }
  } catch (e) {
    console.log('❌ Play Error:', e);
  }
};

const pause = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await TrackPlayer.pause();
    if (callback) {
      callback(currentSurahId, false, 'surah', isVoice);
    }
  } catch (e) {
    console.log('❌ Pause Error:', e);
  }
};

// 🔵 SURAH NAVIGATION with voice mode
const next = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    if (currentSurahId < 114) {
      const nextId = currentSurahId + 1;
      setSurahID(nextId);
      if (callback) callback(nextId, false, 'surah', isVoice);
    } else {
      // Last surah: loop to first
      setSurahID(1);
      if (callback) callback(1, false, 'surah', isVoice);
    }
  } catch (e) {
    console.log('❌ Next Error:', e);
  }
};

const previous = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    if (currentSurahId > 1) {
      const prevId = currentSurahId - 1;
      setSurahID(prevId);
      if (callback) callback(prevId, false, 'surah', isVoice);
    }
  } catch (e) {
    console.log('❌ Previous Error:', e);
  }
};

// 🆕 NEW: Play Surah with Range Support
const playSurah = async (
  surahId,
  ayatArray,
  isVoice = false,
  rangeFrom = null,
  rangeTo = null,
) => {
  try {
    if (!isSetup) await setupPlayer();
    if (!surahId || !Array.isArray(ayatArray) || ayatArray.length === 0) return;

    setVoiceMode(isVoice);
    setSurahID(surahId);
    currentPlaylist = ayatArray;
    currentPlaylistType = 'surah';

    if (callback)
      callback(surahId, false, 'surah', isVoice, rangeFrom, rangeTo);

    await TrackPlayer.reset();

    // 🆕 Get the actual array (could be filtered for range)
    const tracks = ayatArray.map((ayat, idx) => ({
      id: (ayat.AyatNumber || ayat.ayatNumber || idx + 1).toString(),
      url: ayat.audio || ayat.audioUrl,
      title: `Surah ${surahId} - Ayat ${
        ayat.AyatNumber || ayat.ayatNumber || idx + 1
      }`,
      artist: 'Quran Majeed',
      // Store metadata
      surahId: surahId,
      ayatNumber: ayat.AyatNumber || ayat.ayatNumber || idx + 1,
    }));

    if (tracks.length === 0) {
      console.warn('No tracks to play');
      return;
    }

    await TrackPlayer.add(tracks);

    // 🆕 If range specified, skip to first track (index 0 is always correct because array is filtered)
    await TrackPlayer.play();
  } catch (e) {
    console.log('❌ playSurah Error:', e);
  }
};

// 🆕 NEW: Jump to specific ayat with voice mode awareness
const jumpToAyat = async (targetAyatNumber, isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    const queue = await TrackPlayer.getQueue();
    if (!queue || queue.length === 0) return;

    const trackIndex = queue.findIndex(
      track =>
        Number(track.id) === Number(targetAyatNumber) ||
        track.title?.includes(targetAyatNumber.toString()),
    );

    if (trackIndex !== -1) {
      await TrackPlayer.skip(trackIndex);
      await TrackPlayer.play();
      console.log(
        `🎯 Jumped to ayat ${targetAyatNumber}, voice mode: ${isVoice}`,
      );
    } else {
      console.warn(`Ayat ${targetAyatNumber} not found in queue`);
    }
  } catch (error) {
    console.error('Jump To Ayat Error:', error);
  }
};

// 🆕 NEW: Resume from last position with mode separation
const resumeFromLastPosition = async (type, id, isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    const storageKey = isVoice
      ? `voice_resume_${type}_${id}`
      : `resume_${type}_${id}`;
    const savedIndex = await AsyncStorage.getItem(storageKey);

    if (savedIndex !== null) {
      const index = parseInt(savedIndex);
      const queue = await TrackPlayer.getQueue();
      if (queue && queue.length > index) {
        await TrackPlayer.skip(index);
        console.log(
          `📌 Resumed from index ${index} (${
            isVoice ? 'voice' : 'manual'
          } mode)`,
        );
      }
    }
    await TrackPlayer.play();
  } catch (error) {
    console.error('Resume error:', error);
  }
};

// 🆕 NEW: Save current progress with mode awareness
const saveCurrentProgress = async (type, id, index, isVoice = false) => {
  try {
    if (index > 0) {
      const storageKey = isVoice
        ? `voice_resume_${type}_${id}`
        : `resume_${type}_${id}`;
      await AsyncStorage.setItem(storageKey, index.toString());
      console.log(`💾 Progress saved: ${storageKey} = ${index}`);
    }
  } catch (error) {
    console.error('Save progress error:', error);
  }
};

// 🆕 NEW: Clear resume data (for debugging or reset)
const clearResumeData = async (type, id, isVoice = false) => {
  try {
    const storageKey = isVoice
      ? `voice_resume_${type}_${id}`
      : `resume_${type}_${id}`;
    await AsyncStorage.removeItem(storageKey);
    console.log(`🗑️ Cleared: ${storageKey}`);
  } catch (error) {
    console.error('Clear error:', error);
  }
};

// 🟠 BAYAN NAVIGATION with voice mode
const nextBayan = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    if (currentBayanId < 114) {
      currentBayanId += 1;
      if (callback) callback(currentBayanId, false, 'bayan', isVoice);
    }
  } catch (e) {
    console.log('❌ Next Bayan Error:', e);
  }
};

const previousBayan = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    if (currentBayanId > 1) {
      currentBayanId -= 1;
      if (callback) callback(currentBayanId, false, 'bayan', isVoice);
    }
  } catch (e) {
    console.log('❌ Previous Bayan Error:', e);
  }
};

// 🆕 Get current voice mode
const getVoiceMode = () => isVoiceModeActive;

// 🆕 Get current playlist
const getCurrentPlaylist = () => currentPlaylist;

// --- Exporting Object ---
export default {
  registerCallback,
  setSurahID,
  setBayanID,
  setVoiceMode,
  setupPlayer,
  play,
  pause,
  next,
  previous,
  playSurah,
  jumpToAyat,
  nextBayan,
  previousBayan,
  resumeFromLastPosition,
  saveCurrentProgress,
  clearResumeData,
  getCurrentSurahId: () => currentSurahId,
  getCurrentBayanId: () => currentBayanId,
  getVoiceMode,
  getCurrentPlaylist,
};
