//PlayerService.js
import TrackPlayer, {
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

class PlayerService {
  constructor() {
    this.isSetup = false;
    this.currentSurahId = 1;
    this.onSurahChange = null;
  }

  registerCallback = callback => {
    this.onSurahChange = callback;
  };

  setSurahID = id => {
    this.currentSurahId = id;
  };

  setupPlayer = async () => {
    if (this.isSetup) return;
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
      this.isSetup = true;
    } catch (e) {
      this.isSetup = true;
    }
  };

  play = async () => {
    try {
      if (!this.isSetup) await this.setupPlayer();
      console.log('▶️ Service: Executing Play Command');
      await TrackPlayer.play();
    } catch (e) {
      console.log('❌ Play Error:', e);
    }
  };

  pause = async () => {
    try {
      await TrackPlayer.pause();
    } catch (e) {}
  };

  next = async () => {
    try {
      if (this.currentSurahId < 114) {
        const nextId = this.currentSurahId + 1;
        this.setSurahID(nextId);
        if (this.onSurahChange) this.onSurahChange(nextId);
      }
    } catch (e) {}
  };

  previous = async () => {
    try {
      if (this.currentSurahId > 1) {
        const prevId = this.currentSurahId - 1;
        this.setSurahID(prevId);
        if (this.onSurahChange) this.onSurahChange(prevId);
      }
    } catch (e) {}
  };

  // ✅ Play specific Surah with optional from/to ayats
  playSurah = async (surahId, ayatArray) => {
    try {
      if (!this.isSetup) await this.setupPlayer();

      if (!surahId) {
        console.log('❌ Surah ID not provided to playSurah');
        return;
      }

      if (!Array.isArray(ayatArray) || ayatArray.length === 0) {
        console.log('❌ No ayats provided for playSurah');
        return;
      }

      this.setSurahID(surahId);

      if (this.onSurahChange) this.onSurahChange(surahId);

      await TrackPlayer.reset();

      const tracks = ayatArray.map(ayat => ({
        id: ayat.AyatNumber.toString(),
        url: ayat.audio,
        title: `Surah ${surahId} Ayat ${ayat.AyatNumber}`,
      }));

      await TrackPlayer.add(tracks);

      console.log(`▶️ Playing Surah ID: ${surahId} from Ayat ${tracks[0].id}`);

      await TrackPlayer.play();
    } catch (e) {
      console.log('❌ playSurah Error:', e);
    }
  };

  async jumpToAyat(targetAyatNumber) {
    try {
      const queue = await TrackPlayer.getQueue();

      if (!queue || queue.length === 0) {
        console.log('Queue khali hai! Koi Surah play nahi ho rahi.');
        return;
      }

      const trackIndex = queue.findIndex(track => {
        return (
          Number(track.id) === Number(targetAyatNumber) ||
          (track.title && track.title.includes(targetAyatNumber.toString()))
        );
      });

      if (trackIndex !== -1) {
        await TrackPlayer.skip(trackIndex);
        await TrackPlayer.play();
        console.log(
          `✅ Successfully jumped to Ayat ${targetAyatNumber} (Index: ${trackIndex})`,
        );
      } else {
        console.log(
          `❌ Ayat ${targetAyatNumber} is waqt playlist (queue) mein nahi hai.`,
        );
      }
    } catch (error) {
      console.error('Jump To Ayat Error:', error);
    }
  }
}

export default new PlayerService();
