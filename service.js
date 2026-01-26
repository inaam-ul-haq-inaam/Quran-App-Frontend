import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function () {
  // Naye version me 'Event.RemotePlay' use hota hai
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());

  // Agar next/previous button chahiye (Future k liye)
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    console.log('Next Track'),
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    console.log('Prev Track'),
  );
};
