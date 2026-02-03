// playerQueue.js
import TrackPlayer from 'react-native-track-player';
import { pad } from './audioUtils';
import { BASE_URL } from '../../Config/config';

export const preparePlayerQueue = async (ayats, surahId, surahName) => {
  await TrackPlayer.reset();

  const CLEAN_BASE = BASE_URL.trim();

  const tracks = ayats.map((ayat, index) => {
    const ayatNum = ayat.AyatNumber ?? ayat.AyatNo ?? index;

    let url = '';
    if (ayatNum === 0) {
      url = `${CLEAN_BASE}/audio/Al-Afasy/0000.mp3`;
    } else {
      url = `${CLEAN_BASE}/audio/Al-Afasy/${pad(surahId)}${pad(ayatNum)}.mp3`;
    }

    return {
      id: `${surahId}_${index}`,
      url,
      title: ayatNum === 0 ? 'Bismillah' : `Ayat ${ayatNum}`,
      artist: surahName,
    };
  });

  await TrackPlayer.add(tracks);
  await TrackPlayer.skip(0);
  await TrackPlayer.play();
};
