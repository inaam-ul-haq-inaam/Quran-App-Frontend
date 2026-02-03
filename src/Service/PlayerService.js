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

  // 👇👇 UPDATE: Play Logic Simplified (Condition Hata Di) 👇👇
  play = async () => {
    try {
      // 1. Setup Check
      if (!this.isSetup) {
        await this.setupPlayer();
      }

      // 2. Direct Command (Koi if/else nahi)
      // TrackPlayer khud samajhdaar hai, agar already chal raha hoga to ignore kar dega
      // Lekin agar Paused hai to Resume kar dega.
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
        if (this.onSurahChange) this.onSurahChange(nextId);
      }
    } catch (e) {}
  };

  previous = async () => {
    try {
      if (this.currentSurahId > 1) {
        const prevId = this.currentSurahId - 1;
        if (this.onSurahChange) this.onSurahChange(prevId);
      }
    } catch (e) {}
  };
}

export default new PlayerService();
