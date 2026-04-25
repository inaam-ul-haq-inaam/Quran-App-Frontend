// // useAudioPlayer.js

// import { useEffect, useState, useRef } from 'react';
// import TrackPlayer, {
//   Capability,
//   State,
//   usePlaybackState,
//   Event,
//   useProgress,
//   // 👈 useTrackPlayerEvents yahan se hata diya hai taake error na aaye
// } from 'react-native-track-player';

// import { getSurahAyats } from '../../Service/Api';
// import PlayerService from '../../Service/PlayerService';
// import { preparePlayerQueue } from './QueuePlayer';

// export const useAudioPlayer = surahIdParam => {
//   const [surahId, setSurahId] = useState(parseInt(surahIdParam));
//   const [surahName, setSurahName] = useState('');
//   const [ayats, setAyats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const playbackState = usePlaybackState();
//   const progress = useProgress();

//   const isPlaying = (playbackState.state || playbackState) === State.Playing;

//   const skipFetchRef = useRef(false);

//   const handleNext = async () => {
//     if (surahId < 114) {
//       console.log('🔄 Button Next:', surahId + 1);
//       setSurahId(prev => prev + 1);
//     }
//   };

//   const handlePrevious = async () => {
//     if (surahId > 1) {
//       console.log('🔄 Button Prev:', surahId - 1);
//       setSurahId(prev => prev - 1);
//     }
//   };

//   useEffect(() => {
//     const onVoiceCommand = (newId, skipFetch = false) => {
//       console.log('🎤 Voice Command Received in Hook:', newId);
//       if (skipFetch) {
//         skipFetchRef.current = true;
//       }
//       setSurahId(newId);
//     };

//     PlayerService.registerCallback(onVoiceCommand);

//     return () => {
//       PlayerService.registerCallback(null);
//     };
//   }, []);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         if (skipFetchRef.current) {
//           console.log('⏭ Skipping fetch (voice already handled)');
//           skipFetchRef.current = false;
//           return;
//         }

//         setLoading(true);
//         console.log('📥 Syncing Service ID:', surahId);
//         PlayerService.setSurahID(surahId);

//         try {
//           await TrackPlayer.getActiveTrackIndex();
//         } catch {
//           await TrackPlayer.setupPlayer();
//           await TrackPlayer.updateOptions({
//             capabilities: [
//               Capability.Play,
//               Capability.Pause,
//               Capability.SkipToNext,
//               Capability.SkipToPrevious,
//             ],
//           });
//         }

//         let data = await getSurahAyats(surahId);

//         if (!data || data.length === 0) {
//           console.log('No Data Found');
//           setLoading(false);
//           return;
//         }

//         const name =
//           data[0]?.NameEnglish?.split('(')[0]?.trim() || `Surah ${surahId}`;
//         setSurahName(name);
//         setAyats(data);

//         await preparePlayerQueue(data, surahId, name);
//       } catch (error) {
//         console.error('Error loading Audio Player:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();

//     return () => {
//       TrackPlayer.stop();
//     };
//   }, [surahId]);

//   // 🚀 BULLETPROOF LOGIC: Bina crash hue background mein Ayat change detect karega
//   useEffect(() => {
//     let sub1, sub2;

//     // TrackPlayer v4 ke liye check
//     if (Event.PlaybackActiveTrackChanged) {
//       sub1 = TrackPlayer.addEventListener(
//         Event.PlaybackActiveTrackChanged,
//         e => {
//           if (e.index !== undefined && e.index !== null) {
//             setCurrentIndex(e.index);
//           }
//         },
//       );
//     }

//     // TrackPlayer v3 ke liye check (Fallback)
//     if (Event.PlaybackTrackChanged) {
//       sub2 = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, e => {
//         if (e.nextTrack !== undefined && e.nextTrack !== null) {
//           setCurrentIndex(e.nextTrack);
//         }
//       });
//     }

//     // Jab screen band ho to listeners remove kar do
//     return () => {
//       if (sub1) sub1.remove();
//       if (sub2) sub2.remove();
//     };
//   }, []);

//   return {
//     ayats,
//     surahName,
//     loading,
//     currentIndex,
//     isPlaying,
//     progress,
//     play: async () => await TrackPlayer.play(),
//     pause: async () => await TrackPlayer.pause(),
//     next: handleNext,
//     previous: handlePrevious,
//     // 🛠️ Yahan 'seek' aur 'skipToAyat' dono de diye hain taake UI crash na ho
//     seek: async index => await TrackPlayer.skip(index),
//     seekToTime: async sec => await TrackPlayer.seekTo(sec),
//     skipToAyat: async index => await TrackPlayer.skip(index),
//   };
// };

// import { useEffect, useState, useRef } from 'react';
// import { Alert } from 'react-native'; // 👈 Alert add kiya
// import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 Storage add kiya
// import TrackPlayer, {
//   Capability,
//   State,
//   usePlaybackState,
//   Event,
//   useProgress,
// } from 'react-native-track-player';

// import { getSurahAyats, getChainDetails } from '../../Service/Api';
// import PlayerService from '../../Service/PlayerService';
// import { preparePlayerQueue } from './QueuePlayer';

// export const useAudioPlayer = (type, id, title) => {
//   const [currentId, setCurrentId] = useState(id);
//   const [displayName, setDisplayName] = useState(title);
//   const [ayats, setAyats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // 🚀 1. REF: Yeh hamesha latest position yaad rakhega bina overwrite kiye
//   const currentIndexRef = useRef(0);

//   const playbackState = usePlaybackState();
//   const progress = useProgress();
//   const isPlaying = (playbackState.state || playbackState) === State.Playing;
//   const skipFetchRef = useRef(false);

//   // --- Controls (Next/Prev) ---
//   const handleNext = async () => {
//     if (type === 'surah') {
//       if (currentId < 114) setCurrentId(prev => parseInt(prev) + 1);
//     } else {
//       try {
//         await TrackPlayer.skipToNext();
//       } catch (e) {}
//     }
//   };

//   const handlePrevious = async () => {
//     if (type === 'surah') {
//       if (currentId > 1) setCurrentId(prev => parseInt(prev) - 1);
//     } else {
//       try {
//         await TrackPlayer.skipToPrevious();
//       } catch (e) {}
//     }
//   };

//   // --- Voice Command ---
//   useEffect(() => {
//     const onVoiceCommand = (newId, skipFetch = false) => {
//       if (type === 'surah') {
//         if (skipFetch) skipFetchRef.current = true;
//         setCurrentId(newId);
//       }
//     };
//     PlayerService.registerCallback(onVoiceCommand);
//     return () => PlayerService.registerCallback(null);
//   }, [type]);

//   // 🚀 2. TRACK LISTENER: Jab ayat badle, Ref ko update karein
//   useEffect(() => {
//     let sub1, sub2;
//     const updateIndex = index => {
//       if (index !== undefined && index !== null) {
//         setCurrentIndex(index);
//         currentIndexRef.current = index; // 👈 Ref update ho rahi hai
//       }
//     };

//     if (Event.PlaybackActiveTrackChanged) {
//       sub1 = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, e =>
//         updateIndex(e.index),
//       );
//     }
//     if (Event.PlaybackTrackChanged) {
//       sub2 = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, e =>
//         updateIndex(e.nextTrack),
//       );
//     }
//     return () => {
//       if (sub1) sub1.remove();
//       if (sub2) sub2.remove();
//     };
//   }, []);

//   // 🚀 3. MAIN LOADER + RESUME + SAVE (Cleanup)
//   useEffect(() => {
//     const load = async () => {
//       try {
//         if (skipFetchRef.current) {
//           skipFetchRef.current = false;
//           return;
//         }
//         setLoading(true);

//         // Player Setup
//         try {
//           await TrackPlayer.getActiveTrackIndex();
//         } catch {
//           await TrackPlayer.setupPlayer();
//           await TrackPlayer.updateOptions({
//             capabilities: [
//               Capability.Play,
//               Capability.Pause,
//               Capability.SkipToNext,
//               Capability.SkipToPrevious,
//             ],
//           });
//         }

//         // Fetch Data
//         let data = [];
//         let name = title;
//         if (type === 'chain') {
//           data = await getChainDetails(currentId);
//         } else {
//           data = await getSurahAyats(currentId);
//           name =
//             data[0]?.NameEnglish?.split('(')[0]?.trim() || `Surah ${currentId}`;
//           PlayerService.setSurahID(currentId);
//         }

//         if (!data || data.length === 0) {
//           setLoading(false);
//           return;
//         }

//         setDisplayName(name);
//         setAyats(data);

//         // Queue Tayyar karein
//         await preparePlayerQueue(data, currentId, name);

//         // 🔍 Check for Saved Progress
//         const key = `resume_${type}_${currentId}`;
//         const savedValue = await AsyncStorage.getItem(key);
//         console.log('🔍 Checking Key:', key, 'Found Value:', savedValue);

//         if (savedValue !== null && parseInt(savedValue) > 0) {
//           const indexToResume = parseInt(savedValue);

//           Alert.alert(
//             'Resume Tilawat? 📖',
//             'Kya aap wahin se shuru karna chahte hain jahan chhoda tha?',
//             [
//               {
//                 text: 'Nahi',
//                 style: 'cancel',
//                 onPress: () => TrackPlayer.play(),
//               },
//               {
//                 text: 'Haan',
//                 onPress: async () => {
//                   await TrackPlayer.skip(indexToResume);
//                   setCurrentIndex(indexToResume);
//                   currentIndexRef.current = indexToResume; // Ref sync karein
//                   await TrackPlayer.play();
//                 },
//               },
//             ],
//           );
//         } else {
//           await TrackPlayer.play();
//         }
//       } catch (error) {
//         console.error('Error loading:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();

//     // 💾 SAVE ON BACK: Jab user screen band kare
//     return () => {
//       const lastPos = currentIndexRef.current;
//       const key = `resume_${type}_${currentId}`;

//       if (lastPos > 0) {
//         AsyncStorage.setItem(key, lastPos.toString());
//         console.log('💾 Final Progress Saved for', key, ':', lastPos);
//       }
//       TrackPlayer.stop();
//     };
//   }, [currentId, type]); // 👈 Yahan currentIndex NAHI hona chahiye

//   return {
//     ayats,
//     surahName: displayName,
//     loading,
//     currentIndex,
//     isPlaying,
//     progress,
//     play: async () => await TrackPlayer.play(),
//     pause: async () => await TrackPlayer.pause(),
//     next: handleNext,
//     previous: handlePrevious,
//     seek: async index => await TrackPlayer.skip(index),
//     seekToTime: async sec => await TrackPlayer.seekTo(sec),
//     skipToAyat: async index => await TrackPlayer.skip(index),
//   };
// };

import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  Event,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import { getSurahAyats, getChainDetails } from '../../Service/Api';
import PlayerService from '../../Service/PlayerService';
import { preparePlayerQueue } from './QueuePlayer';

export const useAudioPlayer = (type, id, title) => {
  const [currentId, setCurrentId] = useState(id);
  const [displayName, setDisplayName] = useState(title);
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentIndexRef = useRef(0);
  const skipFetchRef = useRef(false);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  // ✅ CORRECT STATE CHECK: Handles both object and string returns
  const isPlaying =
    playbackState.state === State.Playing || playbackState === State.Playing;

  const isBuffering =
    playbackState.state === State.Buffering ||
    playbackState === State.Buffering;

  // 💾 Progress Save Helper
  const saveProgress = useCallback(
    async index => {
      if (index > 0) {
        const key = `resume_${type}_${currentId}`;
        await AsyncStorage.setItem(key, index.toString());
      }
    },
    [type, currentId],
  );

  // --- 🕹️ Controls ---
  const play = async () => {
    try {
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      const trackObject = await TrackPlayer.getTrack(trackIndex);
      console.log('🔗 Testing Audio URL:', trackObject.url); // 👈 Is link ko copy karke browser mein chalayein
      console.log('▶️ Manual Play Attempted...');

      // 1. getState ki jagah getPlaybackState use karein
      const playbackState = await TrackPlayer.getPlaybackState();

      // Naye versions mein state 'playbackState.state' mein hoti hai
      const currentState = playbackState.state || playbackState;
      console.log('🔍 Current Player State:', currentState);

      // 2. Queue check karein
      const queue = await TrackPlayer.getQueue();
      console.log('📋 Tracks in Queue:', queue.length);

      if (queue.length === 0) {
        console.warn('⚠️ Queue khali hai, play nahi ho sakta.');
        return;
      }

      // 3. Play command
      await TrackPlayer.play();
      console.log('✅ Play command sent!');
    } catch (e) {
      console.error('❌ Play Function Error:', e);
    }
  };

  const pause = async () => {
    try {
      console.log('⏸️ Manual Pause Triggered');
      await TrackPlayer.pause();
    } catch (e) {
      console.error('Pause Error:', e);
    }
  };

  const handleNext = async () => {
    try {
      if (type === 'surah' && parseInt(currentId) < 114) {
        setCurrentId(prev => (parseInt(prev) + 1).toString());
      } else {
        await TrackPlayer.skipToNext();
      }
    } catch (e) {
      console.log('Next Error:', e);
    }
  };

  const handlePrevious = async () => {
    try {
      if (type === 'surah' && parseInt(currentId) > 1) {
        setCurrentId(prev => (parseInt(prev) - 1).toString());
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch (e) {
      console.log('Prev Error:', e);
    }
  };

  // --- 📡 Track Change Listener (Standard Way) ---
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.index != null
    ) {
      setCurrentIndex(event.index);
      currentIndexRef.current = event.index;
      saveProgress(event.index);
    }
  });

  // --- 🗣️ Voice Command Bridge ---
  useEffect(() => {
    const onVoiceCommand = (newId, skipFetch = false) => {
      if (type === 'surah') {
        if (skipFetch) skipFetchRef.current = true;
        setCurrentId(newId.toString());
      }
    };
    PlayerService.registerCallback(onVoiceCommand);
    return () => PlayerService.registerCallback(null);
  }, [type]);

  // --- 🚀 Main Data Loader ---
  useEffect(() => {
    let isMounted = true;

    const initPlayer = async () => {
      try {
        if (skipFetchRef.current) {
          skipFetchRef.current = false;
          return;
        }
        setLoading(true);

        // 1. Setup Player (Safe Check)
        try {
          await TrackPlayer.setupPlayer();
          await TrackPlayer.updateOptions({
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.Stop,
              Capability.SeekTo,
            ],
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
            ],
          });
        } catch (e) {
          /* Already setup */
        }

        // 2. Fetch Data
        let data = [];
        let name = title;

        if (type === 'chain') {
          data = await getChainDetails(currentId);
        } else {
          data = await getSurahAyats(currentId);
          name =
            data[0]?.NameEnglish?.split('(')[0]?.trim() || `Surah ${currentId}`;
          PlayerService.setSurahID(currentId);
        }

        if (!isMounted || !data || data.length === 0) {
          setLoading(false);
          return;
        }

        setDisplayName(name);
        setAyats(data);

        // 3. Prepare Queue
        await preparePlayerQueue(data, currentId, name);

        // 4. Resume Logic
        const key = `resume_${type}_${currentId}`;
        const savedValue = await AsyncStorage.getItem(key);
        const indexToResume = savedValue ? parseInt(savedValue) : 0;

        if (indexToResume > 0 && indexToResume < data.length) {
          Alert.alert(
            'Resume Tilawat? 📖',
            `Aap pichli baar Ayat ${indexToResume + 1} par thay.`,
            [
              { text: 'Shuru Se', onPress: () => TrackPlayer.play() },
              {
                text: 'Haan',
                onPress: async () => {
                  await TrackPlayer.skip(indexToResume);
                  setCurrentIndex(indexToResume);
                  await TrackPlayer.play();
                },
              },
            ],
          );
        } else {
          // 🛠️ Force play with a small delay for buffering
          setTimeout(() => {
            if (isMounted) TrackPlayer.play();
          }, 800);
        }
      } catch (err) {
        console.error('Loader Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      // ✅ Progress save karein lekin audio STOP na karein
      saveProgress(currentIndexRef.current);
    };
  }, [currentId, type]);

  return {
    ayats,
    surahName: displayName,
    loading,
    currentIndex,
    isPlaying,
    isBuffering,
    progress,
    play,
    pause,
    next: handleNext,
    previous: handlePrevious,
    seekToAyat: index => TrackPlayer.skip(index),
    seekToTime: sec => TrackPlayer.seekTo(sec),
  };
};
