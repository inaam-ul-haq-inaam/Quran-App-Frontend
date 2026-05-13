// useBayanController.js - Fixed Resume & Voice Support with Force Restart

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native'; // 👈 ADD THIS IMPORT
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Capability,
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PlayerService from '../../Service/PlayerService';
import { getBayanData } from '../../Service/Api';

export const useBayanController = (
  initialBayanList,
  initialIndex,
  isVoiceCommand = false,
) => {
  // ============================================================
  // GET ROUTE PARAMS (for forceRestart)
  // ============================================================
  const route = useRoute();
  const { forceRestart = false } = route.params || {};

  const [bayanList, setBayanList] = useState(initialBayanList);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isReady, setIsReady] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(isVoiceCommand);

  const currentIndexRef = useRef(initialIndex);
  const isVoiceModeRef = useRef(isVoiceCommand);
  const positionRef = useRef(0);
  const forceRestartRef = useRef(forceRestart); // 👈 ADD THIS REF

  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  const data = bayanList[currentIndex];
  const isPlaying =
    playbackState.state === State.Playing || playbackState === State.Playing;

  // ============================================================
  // SAVE PROGRESS (time position in seconds)
  // ============================================================
  const saveProgress = useCallback(
    async (seconds, isVoice = false) => {
      if (seconds > 0 && data) {
        const key = isVoice
          ? `voice_resume_bayan_${data.BayanID}`
          : `resume_bayan_${data.BayanID}`;
        await AsyncStorage.setItem(key, seconds.toString());
        console.log(`💾 Bayan progress saved: ${key} = ${seconds.toFixed(1)}s`);
      }
    },
    [data],
  );

  // ============================================================
  // GET RESUME POSITION (seconds)
  // ============================================================
  const getResumePosition = useCallback(async () => {
    if (!data) return 0;
    const key = isVoiceModeRef.current
      ? `voice_resume_bayan_${data.BayanID}`
      : `resume_bayan_${data.BayanID}`;
    const saved = await AsyncStorage.getItem(key);
    const pos = saved ? parseFloat(saved) : 0;
    console.log(`📖 Bayan resume position: ${pos}s`);
    return pos;
  }, [data]);

  // ============================================================
  // TRACK CHANGE LISTENER
  // ============================================================
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    // For bayan we don't have multiple tracks, but keep for consistency
  });

  // ============================================================
  // PERIODIC PROGRESS SAVE (every 5 seconds)
  // ============================================================
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPlaying && position > 0) {
        await saveProgress(position, isVoiceModeRef.current);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, position, saveProgress]);

  // ============================================================
  // VOICE COMMAND LISTENER
  // ============================================================
  useEffect(() => {
    const onVoiceCommand = async (
      newId,
      skipFetch = false,
      type = 'surah',
      isVoice = false,
      rangeFrom,
      rangeTo,
    ) => {
      if (type === 'bayan') {
        console.log('🎤 BayanController: Voice command for ID:', newId);
        setIsVoiceMode(isVoice);
        isVoiceModeRef.current = isVoice;
        setIsReady(false);

        try {
          const newData = await getBayanData(newId);
          let newList = newData?.Bayans || newData;
          if (newList && newList.length > 0) {
            let idx = 0;
            if (
              rangeFrom !== undefined &&
              rangeFrom !== null &&
              typeof rangeFrom === 'number'
            ) {
              idx = Math.min(rangeFrom, newList.length - 1);
            }
            setBayanList(newList);
            setCurrentIndex(idx);
            currentIndexRef.current = idx;
          } else {
            ToastAndroid.show(
              'No bayan found for this surah',
              ToastAndroid.SHORT,
            );
          }
        } catch (error) {
          console.log('❌ Bayan Fetch Error:', error);
          ToastAndroid.show('Error loading bayan', ToastAndroid.SHORT);
        } finally {
          setIsReady(true);
        }
      }
    };

    PlayerService.registerCallback(onVoiceCommand);
    return () => PlayerService.registerCallback(null);
  }, []);

  // ============================================================
  // NEXT BAYAN
  // ============================================================
  const playNext = useCallback(
    async (isVoice = false) => {
      console.log('⏭️ Next Bayan');
      isVoiceModeRef.current = isVoice;
      if (currentIndex < bayanList.length - 1) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        currentIndexRef.current = newIndex;
      } else {
        PlayerService.nextBayan(isVoice);
      }
    },
    [currentIndex, bayanList.length],
  );

  // ============================================================
  // PREVIOUS BAYAN
  // ============================================================
  const playPrevious = useCallback(
    async (isVoice = false) => {
      console.log('⏮️ Previous Bayan');
      isVoiceModeRef.current = isVoice;
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        currentIndexRef.current = newIndex;
      } else {
        PlayerService.previousBayan(isVoice);
      }
    },
    [currentIndex],
  );

  // ============================================================
  // SETUP AND PLAY BAYAN (WITH FORCE RESTART SUPPORT)
  // ============================================================
  const setupAndPlayBayan = useCallback(async () => {
    if (!data) return;
    setIsReady(false);

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
      /* already setup */
    }

    // ============================================================
    // 🔥 FORCE RESTART - Clear previous audio
    // ============================================================
    if (forceRestartRef.current) {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      console.log('🔄 Force restart - cleared previous bayan');
      // Reset the flag so next time it doesn't force restart unnecessarily
      forceRestartRef.current = false;
    }

    const audioLink = data?.AudioUrl || data?.AudioFile;
    if (!audioLink || audioLink.trim() === '') {
      console.warn('⚠️ No Audio Link found');
      setHasAudio(false);
      setIsReady(true);
      return;
    }

    setHasAudio(true);
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: data.BayanID?.toString() || `bayan_${currentIndex}`,
      url: audioLink,
      title: data.Title || 'Bayan',
      artist: data.ScholarName || data.ScholorName || 'Dr. Israr Ahmed',
    });

    console.log('🎵 Bayan Added:', audioLink);

    // Resume from saved position if NOT voice command (manual mode)
    const resumePos = await getResumePosition();

    // 🔥 If force restart was true, start from beginning (don't resume)
    if (forceRestart) {
      console.log('🎵 Force restart - playing from beginning');
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
      setIsReady(true);
      return;
    }

    if (resumePos > 5 && !isVoiceModeRef.current) {
      // Show resume prompt for manual mode
      Alert.alert(
        'Resume Bayan?',
        `Continue from ${Math.floor(resumePos / 60)}:${Math.floor(
          resumePos % 60,
        )
          .toString()
          .padStart(2, '0')}?`,
        [
          {
            text: 'Start Over',
            onPress: async () => {
              await TrackPlayer.seekTo(0);
              await TrackPlayer.play();
            },
          },
          {
            text: 'Resume',
            onPress: async () => {
              await TrackPlayer.seekTo(resumePos);
              await TrackPlayer.play();
            },
          },
        ],
        { cancelable: false },
      );
      setIsReady(true);
    } else if (isVoiceModeRef.current && resumePos > 0) {
      // Voice mode auto-resume
      console.log(`🎙️ Voice mode - auto-resuming from ${resumePos}s`);
      await TrackPlayer.seekTo(resumePos);
      await TrackPlayer.play();
      setIsReady(true);
    } else {
      setTimeout(async () => {
        await TrackPlayer.play();
        setIsReady(true);
      }, 500);
    }
  }, [data, currentIndex, getResumePosition, forceRestart]);

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    setupAndPlayBayan();
  }, [currentIndex, bayanList]);

  // Save final progress on unmount
  useEffect(() => {
    return () => {
      if (position > 0) {
        saveProgress(position, isVoiceModeRef.current);
      }
    };
  }, [position, saveProgress]);

  // ============================================================
  // CONTROLS
  // ============================================================
  const togglePlayback = async () => {
    if (!hasAudio) return;
    try {
      if (isPlaying) await TrackPlayer.pause();
      else await TrackPlayer.play();
    } catch (e) {
      console.error(e);
    }
  };

  const skipTime = async amount => {
    if (!hasAudio) return;
    const newPos = Math.max(0, Math.min(position + amount, duration));
    await TrackPlayer.seekTo(newPos);
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
    isVoiceMode,
  };
};
