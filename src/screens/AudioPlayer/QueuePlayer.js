// // playerQueue.js
// import TrackPlayer from 'react-native-track-player';
// import { pad } from './audioUtils';
// import { BASE_URL } from '../../Config/config';

// export const preparePlayerQueue = async (ayats, surahId, surahName) => {
//   await TrackPlayer.reset();

//   const CLEAN_BASE = BASE_URL.trim();

//   const tracks = ayats.map((ayat, index) => {
//     const ayatNum = ayat.AyatNumber ?? ayat.AyatNo ?? index;

//     let url = '';
//     if (ayatNum === 0) {
//       url = `${CLEAN_BASE}/audio/Al-Afasy/0000.mp3`;
//     } else {
//       url = `${CLEAN_BASE}/audio/Al-Afasy/${pad(surahId)}${pad(ayatNum)}.mp3`;
//     }

//     return {
//       id: `${surahId}_${index}`,
//       url,
//       title: ayatNum === 0 ? 'Bismillah' : `Ayat ${ayatNum}`,
//       artist: surahName,
//     };
//   });

//   await TrackPlayer.add(tracks);
//   await TrackPlayer.skip(0);
//   await TrackPlayer.play();
// };

// import TrackPlayer from 'react-native-track-player';
// import { pad } from './audioUtils';
// import { BASE_URL } from '../../Config/config';

// export const preparePlayerQueue = async (ayats, surahId, surahName) => {
//   await TrackPlayer.reset();

//   const CLEAN_BASE = BASE_URL.trim();

//   const tracks = ayats.map((ayat, index) => {
//     // 1. Ayat Number identify karein (Chain ke liye lowercase 'ayatNumber' ho sakta hai)
//     const ayatNum = ayat.AyatNumber ?? ayat.ayatNumber ?? index;

//     // 2. URL Logic:
//     // Agar backend se direct link (audio) aa raha hai (jaisa ke Chain ya aapke naye Surah API mein hai)
//     // toh hum wahi use karenge. Warna purana pad logic.
//     let finalUrl = '';

//     if (ayat.audio || ayat.url) {
//       finalUrl = ayat.audio || ayat.url;
//     } else {
//       // Fallback: Purana logic agar API mein audio link na ho
//       if (ayatNum === 0) {
//         finalUrl = `${CLEAN_BASE}/audio/Al-Afasy/0000.mp3`;
//       } else {
//         finalUrl = `${CLEAN_BASE}/audio/Al-Afasy/${pad(surahId)}${pad(
//           ayatNum,
//         )}.mp3`;
//       }
//     }

//     return {
//       id: `track_${surahId}_${index}_${ayatNum}`, // Unique ID for TrackPlayer
//       url: finalUrl,
//       title: ayatNum === 0 ? 'Bismillah' : `Ayat ${ayatNum}`,
//       // 🎯 Chain ke liye artist name (Surah Name) dynamic hona chahiye
//       artist:
//         ayat.surahName || ayat.NameEnglish || surahName || 'Quran Recitation',
//     };
//   });

//   // TrackPlayer mein saare tracks add kar dein
//   await TrackPlayer.add(tracks);

//   // Pehle track se shuru karein
//   await TrackPlayer.skip(0);
//   await TrackPlayer.play();
// };

// QueuePlayer.js

import TrackPlayer from 'react-native-track-player';
import { pad } from './audioUtils';
import { BASE_URL } from '../../Config/config';

/**
 * Player Queue ko prepare karne wala utility function
 * @param {Array} ayats - Ayats ka data array
 * @param {string|number} surahId - Surah ki ID
 * @param {string} surahName - Default display name
 */
export const preparePlayerQueue = async (ayats, surahId, surahName) => {
  try {
    if (!ayats || ayats.length === 0) {
      console.warn('⚠️ QueuePlayer: No ayats provided to prepare queue.');
      return;
    }

    // 1. Reset current player state
    await TrackPlayer.reset();

    const CLEAN_BASE = BASE_URL.trim();

    // 2. Map ayats to TrackPlayer format
    const tracks = ayats.map((ayat, index) => {
      // Ayat Number detection logic (Robust)
      const ayatNum =
        ayat.AyatNumber ??
        ayat.ayatNumber ??
        (index === 0 && ayats[0].ArabicText?.includes('بِسْمِ')
          ? 0
          : index + 1);

      // URL Selection logic
      let finalUrl = '';
      if (ayat.audio || ayat.url) {
        finalUrl = ayat.audio || ayat.url;
      } else {
        // Fallback for Surah mode if audio link is missing in DB
        const paddedSurah = pad(surahId || 1);
        const paddedAyat = pad(ayatNum);

        if (ayatNum === 0) {
          finalUrl = `${CLEAN_BASE}/audio/Al-Afasy/0000.mp3`;
        } else {
          finalUrl = `${CLEAN_BASE}/audio/Al-Afasy/${paddedSurah}${paddedAyat}.mp3`;
        }
      }

      return {
        id: `track_${surahId}_${index}_${ayatNum}`,
        url: finalUrl,
        title: ayatNum === 0 ? 'Bismillah' : `Ayat ${ayatNum}`,
        artist:
          ayat.surahName || ayat.NameEnglish || surahName || 'Quran Majeed',
        // Optional metadata jo UI mein kaam aa sakta hai
        pitchAlgorithm: 'Voice',
        surahId: surahId,
        ayatNumber: ayatNum,
      };
    });

    console.log(`📦 QueuePlayer: Adding ${tracks.length} tracks to queue.`);

    // 3. Add to player and prepare
    await TrackPlayer.add(tracks);

    // Note: Hum yahan skip(0) kar rahe hain taake track 1 par set ho jaye.
    // .play() call hum useAudioPlayer hook mein manage kar rahe hain,
    // lekin safety ke liye yahan sirf queue ready karte hain.
    await TrackPlayer.skip(0);
  } catch (error) {
    console.error('❌ QueuePlayer Error:', error);
    throw error; // Hook ko error ka pata chalne dein
  }
};
