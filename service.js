import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  // Naye version me 'Event.RemotePlay' use hota hai
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  // 🛠️ ASAL FIX: destroy() ki jagah stop() laga diya
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  // 🚀 BONUS: Notification bar k Next/Prev buttons ko bhi zinda kar diya
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext(),
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious(),
  );
};
