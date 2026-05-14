// useBayanController.js - Fixed to handle multiple bayan plays without reload

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, ToastAndroid } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
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

export const useBayanController = (
  initialBayanList,
  initialIndex,
  isVoiceCommand = false,
) => {
  // ============================================================
  // GET ROUTE PARAMS (for forceRestart)
  // ============================================================
  const route = useRoute();
  const { forceRestart = false, _key } = route.params || {};

  const [bayanList, setBayanList] = useState(initialBayanList || []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [isReady, setIsReady] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(isVoiceCommand);

  const currentIndexRef = useRef(initialIndex || 0);
  const isVoiceModeRef = useRef(isVoiceCommand);
  const positionRef = useRef(0);
  const forceRestartRef = useRef(forceRestart);

  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  const data = bayanList[currentIndex];
  const isPlaying =
    playbackState.state === State.Playing || playbackState === State.Playing;

  // Debug logs
  console.log('🎵 BayanController Init:', {
    initialBayanListLength: initialBayanList?.length,
    initialIndex,
    currentIndex,
    firstTitle: bayanList[0]?.Title,
    currentTitle: data?.Title,
    forceRestart,
    key: _key,
  });

  // ============================================================
  // FORCE RESET WHEN NEW BAYAN LIST ARRIVES (FIX FOR MULTIPLE PLAYS)
  // ============================================================
  useEffect(() => {
    // When new bayan list arrives with different content, reset everything
    if (initialBayanList && initialBayanList.length > 0) {
      const isDifferentList =
        JSON.stringify(initialBayanList) !== JSON.stringify(bayanList);
      if (isDifferentList) {
        console.log('🆕 New bayan list detected, resetting player...');
        setBayanList(initialBayanList);
        setCurrentIndex(initialIndex || 0);
        currentIndexRef.current = initialIndex || 0;
        forceRestartRef.current = true;

        // Stop current playback immediately
        const resetPlayer = async () => {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
          console.log('🔄 Player reset due to new bayan list');
        };
        resetPlayer();
      }
    }
  }, [initialBayanList, initialIndex]);

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
        console.log('🎤 BayanController: Voice command for navigation');
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
        console.log('⚠️ Already at last bayan');
        ToastAndroid.show('Last bayan', ToastAndroid.SHORT);
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
        console.log('⚠️ Already at first bayan');
        ToastAndroid.show('First bayan', ToastAndroid.SHORT);
      }
    },
    [currentIndex],
  );

  // ============================================================
  // SETUP AND PLAY BAYAN
  // ============================================================
  const setupAndPlayBayan = useCallback(async () => {
    if (!data) {
      console.log('⚠️ No data available for bayan');
      return;
    }

    setIsReady(false);
    console.log(`🎵 Setting up bayan [${currentIndex}]: ${data.Title}`);

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
    } catch (e) {}

    // ============================================================
    // FORCE RESTART - Clear previous audio
    // ============================================================
    if (forceRestartRef.current) {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      console.log('🔄 Force restart - cleared previous bayan');
      forceRestartRef.current = false;
    }

    const audioLink = data?.AudioUrl;
    if (!audioLink || audioLink.trim() === '') {
      console.warn('⚠️ No Audio Link found');
      setHasAudio(false);
      setIsReady(true);
      return;
    }

    setHasAudio(true);
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: data.BayanID?.toString() || `bayan_${Date.now()}_${currentIndex}`,
      url: audioLink,
      title: data.Title || 'Bayan',
      artist: data.ScholarName || 'Dr. Israr Ahmed',
    });

    console.log(`🎵 Bayan Added [${currentIndex}]: ${audioLink}`);

    const resumePos = await getResumePosition();

    // If force restart, start from beginning
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
