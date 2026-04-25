import TrackPlayer, {
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

// --- Private State (Variables) ---
let isSetup = false;
let currentSurahId = 1;
let currentBayanId = 1;
let callback = null;

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

// PlayerService.js

const play = async () => {
  try {
    const state = await TrackPlayer.getState();
    console.log('🔍 Current State before play:', state);

    // Kabhi kabhi player 'Ready' state mein hota hai par play nahi karta
    // Isliye hum direct play call karte hain
    await TrackPlayer.play();

    if (this.callback) {
      this.callback(this.surahID, true, 'surah');
    }
  } catch (e) {
    console.log('❌ Play Error:', e);
  }
};

const pause = async () => {
  try {
    await TrackPlayer.pause();
    if (this.callback) {
      this.callback(this.surahID, false, 'surah');
    }
  } catch (e) {
    console.log('❌ Pause Error:', e);
  }
};

// 🔵 SURAH NAVIGATION
const next = async () => {
  if (currentSurahId < 114) {
    const nextId = currentSurahId + 1;
    setSurahID(nextId);
    if (callback) callback(nextId, false, 'surah');
  }
};

const previous = async () => {
  if (currentSurahId > 1) {
    const prevId = currentSurahId - 1;
    setSurahID(prevId);
    if (callback) callback(prevId, false, 'surah');
  }
};

// ✅ PLAY LOGIC
const playSurah = async (surahId, ayatArray) => {
  try {
    if (!isSetup) await setupPlayer();
    if (!surahId || !Array.isArray(ayatArray) || ayatArray.length === 0) return;

    setSurahID(surahId);
    if (callback) callback(surahId, false, 'surah');

    await TrackPlayer.reset();

    const tracks = ayatArray.map(ayat => ({
      id: ayat.AyatNumber.toString(),
      url: ayat.audio,
      title: `Surah ${surahId} Ayat ${ayat.AyatNumber}`,
      artist: 'Quran Majeed',
    }));

    await TrackPlayer.add(tracks);
    await TrackPlayer.play();
  } catch (e) {
    console.log('❌ playSurah Error:', e);
  }
};

const jumpToAyat = async targetAyatNumber => {
  try {
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
    }
  } catch (error) {
    console.error('Jump To Ayat Error:', error);
  }
};

// 🟠 BAYAN NAVIGATION
const nextBayan = async () => {
  if (currentBayanId < 114) {
    currentBayanId += 1;
    if (callback) callback(currentBayanId, false, 'bayan');
  }
};

const previousBayan = async () => {
  if (currentBayanId > 1) {
    currentBayanId -= 1;
    if (callback) callback(currentBayanId, false, 'bayan');
  }
};

// --- Exporting Object ---
export default {
  registerCallback,
  setSurahID,
  setBayanID,
  setupPlayer,
  play,
  pause,
  next,
  previous,
  playSurah,
  jumpToAyat,
  nextBayan,
  previousBayan,
  getCurrentSurahId: () => currentSurahId,
  getCurrentBayanId: () => currentBayanId,
};
