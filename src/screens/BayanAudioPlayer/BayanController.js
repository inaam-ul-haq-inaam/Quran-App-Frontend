// useBayanController.js - FIXED VERSION

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [bayanList, setBayanList] = useState(initialBayanList);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isReady, setIsReady] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(isVoiceCommand);

  const currentIndexRef = useRef(initialIndex);
  const isVoiceModeRef = useRef(isVoiceCommand);

  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();

  const data = bayanList[currentIndex];
  const isPlaying =
    playbackState.state === State.Playing || playbackState === State.Playing;

  // ============================================================
  // SAVE PROGRESS
  // ============================================================
  const saveProgress = useCallback(async (index, isVoice = false) => {
    if (index > 0) {
      const key = isVoice
        ? `voice_resume_bayan_${index}`
        : `resume_bayan_${index}`;
      await AsyncStorage.setItem(key, index.toString());
      console.log(`💾 Bayan progress saved: ${key}`);
    }
  }, []);

  // ============================================================
  // GET RESUME INDEX
  // ============================================================
  const getResumeIndex = useCallback(
    async (isVoice = false) => {
      const key = isVoice
        ? `voice_resume_bayan_${currentIndex}`
        : `resume_bayan_${currentIndex}`;
      const saved = await AsyncStorage.getItem(key);
      return saved ? parseInt(saved) : 0;
    },
    [currentIndex],
  );

  // ============================================================
  // TRACK CHANGE LISTENER
  // ============================================================
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.index !== null
    ) {
      console.log('📌 Bayan track changed to:', event.index);
      await saveProgress(event.index, isVoiceModeRef.current);
    }
  });

  // ============================================================
  // VOICE COMMAND LISTENER
  // ============================================================
  useEffect(() => {
    const onVoiceCommand = async (
      newId,
      skipFetch = false,
      type = 'surah',
      isVoice = false,
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
            setBayanList(newList);
            setCurrentIndex(0);
            currentIndexRef.current = 0;
          }
        } catch (error) {
          console.log('❌ Bayan Fetch Error:', error);
        } finally {
          setIsReady(true);
        }
      }
    };

    PlayerService.registerCallback(onVoiceCommand);
    return () => PlayerService.registerCallback(null);
  }, []);

  // ============================================================
  // NEXT BAYAN (Voice command support)
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
        // Try to get next bayan from service
        PlayerService.nextBayan(isVoice);
      }
    },
    [currentIndex, bayanList.length],
  );

  // ============================================================
  // PREVIOUS BAYAN (Voice command support)
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
  // SETUP AND PLAY BAYAN
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
    } catch (e) {}

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

    // Check for resume position
    const resumeIndex = await getResumeIndex(isVoiceModeRef.current);

    if (resumeIndex > 0 && !isVoiceModeRef.current) {
      // Manual mode: Show resume prompt
      // You can add Alert here if needed
      await TrackPlayer.seekTo(resumeIndex);
    }

    setTimeout(async () => {
      await TrackPlayer.play();
      setIsReady(true);
    }, 800);
  }, [data, currentIndex, getResumeIndex]);

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    setupAndPlayBayan();
  }, [currentIndex, bayanList]);

  // Save progress on unmount
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
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
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
