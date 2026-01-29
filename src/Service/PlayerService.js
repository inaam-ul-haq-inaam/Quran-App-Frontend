import TrackPlayer, { State } from 'react-native-track-player';

class AudioPlayerService {
  // 1. Play
  play = async () => {
    const state = await TrackPlayer.getPlaybackState();
    // State check zaroori hai (V4 syntax safe)
    if ((state.state || state) !== State.Playing) {
      await TrackPlayer.play();
    }
  };

  // 2. Pause
  pause = async () => {
    await TrackPlayer.pause();
  };

  // 3. Stop
  stop = async () => {
    await TrackPlayer.stop();
  };

  // 4. Next Ayat (Agar Aakhri Ayat hui to Screen khud Next Surah load karegi)
  next = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (e) {
      console.log('No next track');
    }
  };

  // 5. Previous Ayat
  previous = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (e) {
      console.log('No previous track');
    }
  };
}

export default new AudioPlayerService();
