// ============================================================
// PLAYER SERVICE
// Responsible for: TrackPlayer management, playback controls,
//                  Surah/Bayan navigation, progress saving
// ============================================================

import TrackPlayer, {
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// PRIVATE STATE VARIABLES
// ============================================================

let isSetup = false;
let currentSurahId = 1;
let currentBayanId = 1;
let callback = null;
let currentPlaylist = [];
let currentPlaylistType = 'surah';
let isVoiceModeActive = false;

// ============================================================
// HELPER: Register Callback for Voice Commands
// ============================================================

const registerCallback = cb => {
  callback = cb;
  console.log('✅ PlayerService: Callback registered');
};

// ============================================================
// HELPER: Set Current Surah ID
// ============================================================

const setSurahID = id => {
  if (id && !isNaN(parseInt(id))) {
    currentSurahId = parseInt(id);
    console.log('✅ PlayerService: Surah ID set to', currentSurahId);
  } else {
    console.warn('⚠️ Invalid Surah ID, keeping:', currentSurahId);
  }
};

// ============================================================
// HELPER: Get Current Surah ID
// ============================================================

const getCurrentSurahId = () => {
  return currentSurahId;
};

// ============================================================
// HELPER: Set Current Bayan ID
// ============================================================

const setBayanID = id => {
  if (id && !isNaN(parseInt(id))) {
    currentBayanId = parseInt(id);
    console.log('✅ PlayerService: Bayan ID set to', currentBayanId);
  } else {
    console.warn('⚠️ Invalid Bayan ID, keeping:', currentBayanId);
  }
};

// ============================================================
// HELPER: Get Current Bayan ID
// ============================================================

const getCurrentBayanId = () => {
  return currentBayanId;
};

// ============================================================
// HELPER: Set Voice Mode
// ============================================================

const setVoiceMode = isVoice => {
  isVoiceModeActive = isVoice === true;
  console.log('🎙️ Voice mode:', isVoiceModeActive);
};

// ============================================================
// HELPER: Get Voice Mode
// ============================================================

const getVoiceMode = () => {
  return isVoiceModeActive;
};

// ============================================================
// HELPER: Setup TrackPlayer (called once)
// ============================================================

const setupPlayer = async () => {
  if (isSetup) {
    console.log('✅ Player already setup');
    return;
  }

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
    console.log('✅ TrackPlayer setup complete');
  } catch (e) {
    console.log('⚠️ TrackPlayer setup error (might already exist):', e);
    isSetup = true;
  }
};

// ============================================================
// PLAYBACK CONTROLS
// ============================================================

// 0. Stop and Reset (NEW - for Bayan and new audio)
// ============================================================
// PlayerService.js - Fixed stopAndReset (without getState)

const stopAndReset = async () => {
  try {
    // First ensure player is setup
    await setupPlayer();

    // Try to check if player has any tracks by getting queue
    try {
      const queue = await TrackPlayer.getQueue();
      if (queue && queue.length > 0) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        console.log('🔄 Player stopped and reset');
      } else {
        console.log('⚠️ No tracks in queue, skipping stop/reset');
        await TrackPlayer.reset(); // Still reset to be safe
      }
    } catch (queueError) {
      console.log('⚠️ Could not get queue, resetting anyway');
      await TrackPlayer.reset();
    }
  } catch (e) {
    console.log('❌ Stop and reset error:', e);
    // Don't throw - just log the error
  }
};

// 1. Play
const play = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    // Get current state safely (avoid getState error)
    let state = null;
    try {
      const playbackState = await TrackPlayer.getPlaybackState();
      state = playbackState?.state;
    } catch (e) {
      console.log('Could not get state:', e);
    }
    console.log('🔍 Current State before play:', state);
    await TrackPlayer.play();

    if (callback) {
      callback(currentSurahId, true, 'surah', isVoice);
    }
    console.log('▶️ Play command executed');
  } catch (e) {
    console.error('❌ Play Error:', e);
  }
};

// 2. Pause
const pause = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await TrackPlayer.pause();
    if (callback) {
      callback(currentSurahId, false, 'surah', isVoice);
    }
    console.log('⏸️ Pause command executed');
  } catch (e) {
    console.error('❌ Pause Error:', e);
  }
};

// 3. Stop
const stop = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await TrackPlayer.stop();
    await TrackPlayer.seekTo(0);
    console.log('⏹️ Stop command executed');
  } catch (e) {
    console.error('❌ Stop Error:', e);
  }
};

// 4. Next Ayat / Next Surah
const next = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    const queue = await TrackPlayer.getQueue();
    const currentIndex = await TrackPlayer.getActiveTrackIndex();

    // If there's a queue and not at last track, go to next track
    if (
      queue &&
      queue.length > 0 &&
      currentIndex !== null &&
      currentIndex < queue.length - 1
    ) {
      await TrackPlayer.skipToNext();
      console.log('⏭️ Next ayat played');
      if (callback) callback(currentSurahId, false, 'surah', isVoice);
      return;
    }

    // Otherwise, move to next surah
    if (currentSurahId < 114) {
      const nextId = currentSurahId + 1;
      setSurahID(nextId);
      console.log('⏭️ Moving to next surah:', nextId);
      if (callback) callback(nextId, false, 'surah', isVoice);
    } else {
      // Last surah: loop to first
      setSurahID(1);
      console.log('⏭️ Looping to first surah');
      if (callback) callback(1, false, 'surah', isVoice);
    }
  } catch (e) {
    console.error('❌ Next Error:', e);
  }
};

// 5. Previous Ayat / Previous Surah
const previous = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    const currentIndex = await TrackPlayer.getActiveTrackIndex();
    const position = await TrackPlayer.getPosition();

    // If less than 3 seconds and not first track, go to previous track
    if (position < 3 && currentIndex !== null && currentIndex > 0) {
      await TrackPlayer.skipToPrevious();
      console.log('⏮️ Previous ayat played');
      if (callback) callback(currentSurahId, false, 'surah', isVoice);
      return;
    }

    // Otherwise, if at first track, go to previous surah
    if (currentIndex === 0 && position < 3 && currentSurahId > 1) {
      const prevId = currentSurahId - 1;
      setSurahID(prevId);
      console.log('⏮️ Moving to previous surah:', prevId);
      if (callback) callback(prevId, false, 'surah', isVoice);
      return;
    }

    // Else seek to start of current track
    await TrackPlayer.seekTo(0);
    console.log('⏮️ Seek to start of current ayat');
  } catch (e) {
    console.error('❌ Previous Error:', e);
  }
};

// 6. Next Surah (Direct navigation)
const nextSurah = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    if (currentSurahId < 114) {
      const nextId = currentSurahId + 1;
      setSurahID(nextId);
      console.log('⏭️ Next surah (direct):', nextId);
      if (callback) callback(nextId, false, 'surah', isVoice);
      return true;
    } else {
      console.log('⚠️ Already at last surah');
      return false;
    }
  } catch (e) {
    console.error('❌ Next Surah Error:', e);
    return false;
  }
};

// 7. Previous Surah (Direct navigation)
const previousSurah = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    if (currentSurahId > 1) {
      const prevId = currentSurahId - 1;
      setSurahID(prevId);
      console.log('⏮️ Previous surah (direct):', prevId);
      if (callback) callback(prevId, false, 'surah', isVoice);
      return true;
    } else {
      console.log('⚠️ Already at first surah');
      return false;
    }
  } catch (e) {
    console.error('❌ Previous Surah Error:', e);
    return false;
  }
};

// ============================================================
// SURAH PLAYBACK
// ============================================================

const playSurah = async (
  surahId,
  ayatArray,
  isVoice = false,
  rangeFrom = null,
  rangeTo = null,
) => {
  try {
    if (!surahId) {
      console.error('❌ playSurah: No surahId provided');
      return;
    }

    if (!ayatArray || !Array.isArray(ayatArray) || ayatArray.length === 0) {
      console.error('❌ playSurah: Invalid ayatArray');
      return;
    }

    await setupPlayer();
    setVoiceMode(isVoice);
    setSurahID(surahId);
    currentPlaylist = ayatArray;
    currentPlaylistType = 'surah';

    if (callback) {
      callback(surahId, false, 'surah', isVoice, rangeFrom, rangeTo);
    }

    await TrackPlayer.reset();

    const tracks = ayatArray.map((ayat, idx) => ({
      id: (ayat.ayatNumber || ayat.AyatNumber || idx + 1).toString(),
      url: ayat.audio || ayat.audioUrl,
      title: `Surah ${surahId} - Ayat ${
        ayat.ayatNumber || ayat.AyatNumber || idx + 1
      }`,
      artist: 'Quran Majeed',
      surahId: surahId,
      ayatNumber: ayat.ayatNumber || ayat.AyatNumber || idx + 1,
    }));

    if (tracks.length === 0) {
      console.warn('⚠️ No tracks to play');
      return;
    }

    await TrackPlayer.add(tracks);
    await TrackPlayer.play();
    console.log(`🎵 Playing surah ${surahId} with ${tracks.length} ayats`);
  } catch (e) {
    console.error('❌ playSurah Error:', e);
  }
};

// ============================================================
// AYAT NAVIGATION
// ============================================================

const jumpToAyat = async (targetAyatNumber, isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    const queue = await TrackPlayer.getQueue();
    if (!queue || queue.length === 0) {
      console.warn('⚠️ No queue available to jump');
      return;
    }

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
      console.warn(`⚠️ Ayat ${targetAyatNumber} not found in queue`);
    }
  } catch (error) {
    console.error('❌ Jump To Ayat Error:', error);
  }
};

// ============================================================
// PROGRESS MANAGEMENT
// ============================================================

const resumeFromLastPosition = async (type, id, isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

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
    console.error('❌ Resume error:', error);
  }
};

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
    console.error('❌ Save progress error:', error);
  }
};

const clearResumeData = async (type, id, isVoice = false) => {
  try {
    const storageKey = isVoice
      ? `voice_resume_${type}_${id}`
      : `resume_${type}_${id}`;
    await AsyncStorage.removeItem(storageKey);
    console.log(`🗑️ Cleared: ${storageKey}`);
  } catch (error) {
    console.error('❌ Clear error:', error);
  }
};

// ============================================================
// BAYAN NAVIGATION
// ============================================================

const nextBayan = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    if (currentBayanId < 114) {
      currentBayanId += 1;
      console.log('⏭️ Next Bayan ID:', currentBayanId);
      if (callback) callback(currentBayanId, false, 'bayan', isVoice);
    } else {
      console.log('⚠️ Already at last bayan');
    }
  } catch (e) {
    console.error('❌ Next Bayan Error:', e);
  }
};

const previousBayan = async (isVoice = false) => {
  try {
    setVoiceMode(isVoice);
    await setupPlayer();

    if (currentBayanId > 1) {
      currentBayanId -= 1;
      console.log('⏮️ Previous Bayan ID:', currentBayanId);
      if (callback) callback(currentBayanId, false, 'bayan', isVoice);
    } else {
      console.log('⚠️ Already at first bayan');
    }
  } catch (e) {
    console.error('❌ Previous Bayan Error:', e);
  }
};

// ============================================================
// PLAYLIST MANAGEMENT
// ============================================================

const getCurrentPlaylist = () => {
  return currentPlaylist;
};

const getCurrentPlaylistType = () => {
  return currentPlaylistType;
};

const clearPlaylist = () => {
  currentPlaylist = [];
  currentPlaylistType = 'surah';
  console.log('🗑️ Playlist cleared');
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  // Callback
  registerCallback,

  // IDs
  setSurahID,
  getCurrentSurahId,
  setBayanID,
  getCurrentBayanId,

  // Voice Mode
  setVoiceMode,
  getVoiceMode,

  // Setup
  setupPlayer,

  // Playback Controls
  stopAndReset, // 👈 NEW EXPORT
  play,
  pause,
  stop,
  next,
  previous,
  nextSurah,
  previousSurah,

  // Surah Playback
  playSurah,
  jumpToAyat,

  // Progress Management
  resumeFromLastPosition,
  saveCurrentProgress,
  clearResumeData,

  // Bayan Navigation
  nextBayan,
  previousBayan,

  // Playlist
  getCurrentPlaylist,
  getCurrentPlaylistType,
  clearPlaylist,
};
