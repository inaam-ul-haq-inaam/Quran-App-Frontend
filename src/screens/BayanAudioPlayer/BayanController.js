// // useBayanController.js
// import { useState, useEffect } from 'react';
// import TrackPlayer, { State } from 'react-native-track-player';

// // 👈 NAYA: In dono imports ko apne folder structure k hisaab se adjust kar lijiyega
// import PlayerService from '../../Service/PlayerService';
// import { getBayanData } from '../../Service/Api';

// export const BayanController = (initialBayanList, initialIndex) => {
//   // 👈 NAYA: bayanList ko state bana diya taake naya bayan aane par screen update ho
//   const [bayanList, setBayanList] = useState(initialBayanList);
//   const [currentIndex, setCurrentIndex] = useState(initialIndex);

//   const data = bayanList[currentIndex];

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isReady, setIsReady] = useState(false);
//   const [hasAudio, setHasAudio] = useState(true);

//   const [position, setPosition] = useState(0);
//   const [duration, setDuration] = useState(0);

//   // 🚀 NAYA: Voice Command se aane walay signals sun-ne k liye Listener
//   useEffect(() => {
//     const onVoiceCommand = async (newId, skipFetch = false, type = 'surah') => {
//       // Jab signal 'bayan' ka aye, toh API se naya bayan mangwao
//       if (type === 'bayan') {
//         console.log('🎤 BayanController received new Surah ID:', newId);
//         setIsReady(false); // UI ko loading state mein daalo

//         try {
//           const newData = await getBayanData(newId);

//           // 🛠️ ASAL FIX: API response mein se 'Bayans' ki array nikal lein
//           let newList = newData;
//           if (newData && newData.Bayans) {
//             newList = newData.Bayans;
//           }

//           if (newList && newList.length > 0) {
//             console.log(
//               '✅ Naya Bayan load ho gaya, Total tracks:',
//               newList.length,
//             );
//             setBayanList(newList); // Naya bayan set ho gaya
//             setCurrentIndex(0); // Pehle track se start karo
//           } else {
//             console.log('❌ Naya Bayan nahi mila ya array khali hai');
//             setIsReady(true);
//           }
//         } catch (error) {
//           console.log('❌ API Fetch Error:', error);
//           setIsReady(true);
//         }
//       }
//     };

//     // Callback ko active kiya
//     PlayerService.registerCallback(onVoiceCommand);

//     return () => {
//       PlayerService.registerCallback(null);
//     };
//   }, []);

//   useEffect(() => {
//     return () => {
//       TrackPlayer.stop();
//     };
//   }, []);

//   // 👈 NAYA: Dependency mein bayanList add kiya taake naya data aanay par auto-play ho
//   useEffect(() => {
//     if (data) {
//       setupAndPlayBayan();
//     }
//   }, [currentIndex, bayanList]);

//   useEffect(() => {
//     let interval;
//     if (isPlaying && hasAudio) {
//       interval = setInterval(async () => {
//         try {
//           const progress = await TrackPlayer.getProgress();
//           setPosition(progress.position || 0);
//           setDuration(progress.duration || 0);
//         } catch (e) {
//           // Ignore
//         }
//       }, 1000);
//     } else {
//       clearInterval(interval);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying, hasAudio]);

//   const setupAndPlayBayan = async () => {
//     setIsReady(false);

//     try {
//       try {
//         await TrackPlayer.getPlaybackState();
//       } catch (e) {
//         await TrackPlayer.setupPlayer();
//       }

//       const audioLink = data?.AudioUrl || data?.AudioFile;

//       if (!audioLink || audioLink.trim() === '') {
//         setHasAudio(false);
//         setIsReady(true);
//         return;
//       }

//       setHasAudio(true);
//       await TrackPlayer.reset();

//       await TrackPlayer.add({
//         id: data.BayanID ? data.BayanID.toString() : '1',
//         url: audioLink,
//         title: data.Title || 'Unknown Title',
//         artist: data.ScholarName || data.ScholorName || 'Dr Israr Ahmed',
//       });

//       await TrackPlayer.play();
//       setIsPlaying(true);
//       setIsReady(true);
//     } catch (error) {
//       console.error('Player Setup Error: ', error);
//       setHasAudio(false);
//       setIsReady(true);
//     }
//   };

//   const togglePlayback = async () => {
//     if (!hasAudio) return;
//     try {
//       const playbackObj = await TrackPlayer.getPlaybackState();
//       if (playbackObj.state === State.Playing) {
//         await TrackPlayer.pause();
//         setIsPlaying(false);
//       } else {
//         await TrackPlayer.play();
//         setIsPlaying(true);
//       }
//     } catch (e) {
//       console.error('Playback toggle error:', e);
//     }
//   };

//   const skipTime = async amount => {
//     if (!hasAudio) return;
//     try {
//       const progress = await TrackPlayer.getProgress();
//       const currentPos = progress.position;
//       const currentDur = progress.duration;
//       const newPos = currentPos + amount;

//       await TrackPlayer.seekTo(Math.max(0, Math.min(newPos, currentDur)));
//       setPosition(Math.max(0, Math.min(newPos, currentDur)));
//     } catch (e) {
//       console.error('Skip time error:', e);
//     }
//   };

//   const playNext = () => {
//     if (currentIndex < bayanList.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     } else {
//       // 👈 NAYA: Agar Fatiha ka bayan khtam ho gaya ha to agli Surah ka mangwao
//       PlayerService.nextBayan();
//     }
//   };

//   const playPrevious = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     } else {
//       // 👈 NAYA: Pichli surah ka bayan mangwao
//       PlayerService.previousBayan();
//     }
//   };

//   return {
//     data,
//     currentIndex,
//     isPlaying,
//     isReady,
//     hasAudio,
//     position,
//     duration,
//     togglePlayback,
//     skipTime,
//     playNext,
//     playPrevious,
//   };
// };

import { useState, useEffect, useCallback } from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Capability,
} from 'react-native-track-player';

import PlayerService from '../../Service/PlayerService';
import { getBayanData } from '../../Service/Api';

export const useBayanController = (initialBayanList, initialIndex) => {
  const [bayanList, setBayanList] = useState(initialBayanList);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isReady, setIsReady] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);

  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(); // 👈 Manual interval ki zaroorat nahi

  const data = bayanList[currentIndex];

  // ✅ REAL-TIME PLAYBACK STATE
  const isPlaying =
    playbackState.state === State.Playing || playbackState === State.Playing;

  // 🚀 Voice Command Listener
  useEffect(() => {
    const onVoiceCommand = async (newId, skipFetch = false, type = 'surah') => {
      if (type === 'bayan') {
        console.log('🎤 BayanController: New Signal for ID:', newId);
        setIsReady(false);

        try {
          const newData = await getBayanData(newId);
          let newList = newData?.Bayans || newData;

          if (newList && newList.length > 0) {
            setBayanList(newList);
            setCurrentIndex(0);
          } else {
            setIsReady(true);
          }
        } catch (error) {
          console.log('❌ Bayan Fetch Error:', error);
          setIsReady(true);
        }
      }
    };

    PlayerService.registerCallback(onVoiceCommand);
    return () => PlayerService.registerCallback(null);
  }, []);

  // 🔄 Setup and Play Logic
  const setupAndPlayBayan = useCallback(async () => {
    if (!data) return;
    setIsReady(false);

    try {
      // Setup Check
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
        });
      } catch (e) {
        /* Setup already exists */
      }

      const audioLink = data?.AudioUrl || data?.AudioFile;

      if (!audioLink || audioLink.trim() === '') {
        console.warn('⚠️ No Audio Link found for this Bayan');
        setHasAudio(false);
        setIsReady(true);
        return;
      }

      setHasAudio(true);
      await TrackPlayer.reset();

      await TrackPlayer.add({
        id: data.BayanID?.toString() || 'bayan_1',
        url: audioLink, // 👈 IP sahi hona zaroori hai
        title: data.Title || 'Bayan',
        artist: data.ScholarName || data.ScholorName || 'Dr. Israr Ahmed',
      });

      console.log('🎵 Bayan Added to Queue:', audioLink);

      // Force play after a small delay
      setTimeout(async () => {
        await TrackPlayer.play();
        setIsReady(true);
      }, 800);
    } catch (error) {
      console.error('❌ Bayan Player Error: ', error);
      setHasAudio(false);
      setIsReady(true);
    }
  }, [data]);

  // Handle Track Change or List Update
  useEffect(() => {
    setupAndPlayBayan();
  }, [currentIndex, bayanList, setupAndPlayBayan]);

  // 🕹️ Controls
  const togglePlayback = async () => {
    if (!hasAudio) return;
    try {
      if (isPlaying) {
        console.log('🔴 Manual Pause');
        await TrackPlayer.pause();
      } else {
        console.log('🟢 Manual Play');
        await TrackPlayer.play();
      }
    } catch (e) {
      console.error('Toggle Error:', e);
    }
  };

  const skipTime = async amount => {
    if (!hasAudio) return;
    const newPos = position + amount;
    await TrackPlayer.seekTo(Math.max(0, Math.min(newPos, duration)));
  };

  const playNext = () => {
    if (currentIndex < bayanList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      PlayerService.nextBayan();
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      PlayerService.previousBayan();
    }
  };

  return {
    data,
    currentIndex,
    isPlaying,
    isReady,
    hasAudio,
    position,
    duration,
    togglePlayback,
    skipTime,
    playNext,
    playPrevious,
  };
};
