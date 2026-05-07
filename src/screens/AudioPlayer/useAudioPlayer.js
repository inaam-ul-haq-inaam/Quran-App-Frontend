// useAudioPlayer.js - UPDATED WITH FORCE RESTART SUPPORT

import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  Event,
  useProgress,
  useTrackPlayerEvents,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

import { getSurahAyats, getChainDetails } from '../../Service/Api';
import PlayerService from '../../Service/PlayerService';

export const useAudioPlayer = (playType, playId, playTitle) => {
  const [ayats, setAyats] = useState([]);
  const [surahName, setSurahName] = useState(playTitle);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const currentIndexRef = useRef(0);
  const isVoiceModeRef = useRef(false);
  const currentIdRef = useRef(playId);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  const isPlaying =
    playbackState.state === State.Playing || playbackState === State.Playing;

  const isBuffering =
    playbackState.state === State.Buffering ||
    playbackState === State.Buffering;

  // Get params from route (for forceRestart and isResume)
  // Note: These need to be passed via route params
  const [forceRestart, setForceRestart] = useState(false);
  const [isResumeMode, setIsResumeMode] = useState(false);

  // Save progress with mode awareness
  const saveProgress = useCallback(
    async (index, isVoice = false) => {
      if (index > 0) {
        const key = isVoice
          ? `voice_resume_${playType}_${playId}`
          : `resume_${playType}_${playId}`;
        await AsyncStorage.setItem(key, index.toString());
        console.log(`💾 Saved: ${key} = ${index}`);
      }
    },
    [playType, playId],
  );

  // Get resume index based on mode (without prompt)
  const getResumeIndexSilent = useCallback(
    async isVoice => {
      const key = isVoice
        ? `voice_resume_${playType}_${playId}`
        : `resume_${playType}_${playId}`;
      const savedValue = await AsyncStorage.getItem(key);
      const index = savedValue ? parseInt(savedValue) : 0;
      console.log(`📖 Resume check (${isVoice ? 'voice' : 'manual'}):`, index);
      return index;
    },
    [playType, playId],
  );

  // Check if should show resume prompt
  const shouldShowResumePrompt = useCallback(async () => {
    // Don't show prompt if forceRestart is true
    if (forceRestart) return false;
    // Only show prompt for manual mode
    if (isVoiceModeRef.current) return false;

    const key = `resume_${playType}_${playId}`;
    const savedValue = await AsyncStorage.getItem(key);
    return savedValue !== null && parseInt(savedValue) > 0;
  }, [playType, playId, forceRestart]);

  // --- Player Controls ---
  const play = async () => {
    try {
      await TrackPlayer.play();
      console.log('▶️ Play command sent');
    } catch (e) {
      console.error('Play Error:', e);
    }
  };

  const pause = async () => {
    try {
      await TrackPlayer.pause();
      console.log('⏸️ Pause command sent');
    } catch (e) {
      console.error('Pause Error:', e);
    }
  };

  const next = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentTrack = await TrackPlayer.getActiveTrackIndex();

      if (currentTrack !== null && currentTrack < queue.length - 1) {
        await TrackPlayer.skipToNext();
      } else if (playType === 'surah' && parseInt(playId) < 114) {
        const nextId = parseInt(playId) + 1;
        const nextAyats = await getSurahAyats(nextId);
        if (nextAyats?.length > 0) {
          await PlayerService.playSurah(
            nextId,
            nextAyats,
            isVoiceModeRef.current,
          );
        }
      } else {
        await TrackPlayer.skip(0);
      }
    } catch (e) {
      console.log('Next Error:', e);
    }
  };

  const previous = async () => {
    try {
      const currentTrack = await TrackPlayer.getActiveTrackIndex();
      const progress = await TrackPlayer.getPosition();

      if (progress < 3 && currentTrack > 0) {
        await TrackPlayer.skipToPrevious();
      } else {
        await TrackPlayer.seekTo(0);
      }
    } catch (e) {
      console.log('Previous Error:', e);
    }
  };

  const seekToTime = async seconds => {
    try {
      await TrackPlayer.seekTo(seconds);
    } catch (e) {
      console.log('Seek Error:', e);
    }
  };

  // Track change listener with progress save
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.index !== null &&
      event.index !== undefined
    ) {
      setCurrentIndex(event.index);
      currentIndexRef.current = event.index;
      await saveProgress(event.index, isVoiceModeRef.current);

      // Save last played surah for resume
      if (playType === 'surah') {
        await AsyncStorage.setItem('last_played_surah', playId.toString());
      }
    }
  });

  // Voice command callback handler
  useEffect(() => {
    const onVoiceCommand = async (
      newId,
      isPlaying,
      type,
      isVoice,
      rangeFrom,
      rangeTo,
    ) => {
      console.log('🎙️ Voice command received:', {
        newId,
        isVoice,
        rangeFrom,
        rangeTo,
      });
      isVoiceModeRef.current = isVoice;
      setIsVoiceMode(isVoice);
      currentIdRef.current = newId;

      if (rangeFrom || rangeTo) {
        const ayatsData = await getSurahAyats(newId);
        if (ayatsData?.length > 0) {
          let filteredAyats = [...ayatsData];
          if (rangeFrom && rangeTo) {
            filteredAyats = ayatsData.slice(rangeFrom - 1, rangeTo);
          } else if (rangeFrom) {
            filteredAyats = [ayatsData[rangeFrom - 1]];
          }
          await PlayerService.playSurah(
            newId,
            filteredAyats,
            isVoice,
            rangeFrom,
            rangeTo,
          );
        }
      }
    };

    PlayerService.registerCallback(onVoiceCommand);
    return () => PlayerService.registerCallback(null);
  }, []);

  // Main data loader with conditional resume prompt
  useEffect(() => {
    let isMounted = true;
    let hasShownPrompt = false;

    const initPlayer = async () => {
      try {
        setLoading(true);

        // Setup TrackPlayer if needed
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
              Capability.SeekTo,
            ],
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
            ],
          });
        } catch (e) {
          console.log('Player already initialized');
        }

        // 🆕 If forceRestart is true, clear saved progress
        if (forceRestart) {
          const key = `resume_${playType}_${playId}`;
          const voiceKey = `voice_resume_${playType}_${playId}`;
          await AsyncStorage.removeItem(key);
          await AsyncStorage.removeItem(voiceKey);
          console.log('🔄 Force restart - cleared saved progress');
        }

        // Fetch data
        let data = [];
        let name = playTitle;

        if (playType === 'chain') {
          data = await getChainDetails(playId);
        } else {
          data = await getSurahAyats(playId);
          if (data && data.length > 0) {
            name =
              data[0]?.NameEnglish?.split('(')[0]?.trim() || `Surah ${playId}`;
          }
          PlayerService.setSurahID(playId);
        }

        if (!isMounted) return;

        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        setAyats(data);
        setSurahName(name);

        // Prepare queue
        const tracks = data.map((ayat, idx) => ({
          id: (ayat.AyatNumber || ayat.ayatNumber || idx + 1).toString(),
          url: ayat.audio || ayat.audioUrl || ayat.url,
          title: `Ayat ${ayat.AyatNumber || ayat.ayatNumber || idx + 1}`,
          artist: name,
        }));

        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);

        // Resume logic with mode separation
        const shouldPrompt = await shouldShowResumePrompt();
        const resumeIndex = await getResumeIndexSilent(isVoiceModeRef.current);

        // 🆕 Handle isResumeMode (from voice resume command)
        if (isResumeMode && resumeIndex > 0) {
          console.log(
            `🎤 Resume mode: Continuing from ayat ${resumeIndex + 1}`,
          );
          await TrackPlayer.skip(resumeIndex);
          setCurrentIndex(resumeIndex);
          currentIndexRef.current = resumeIndex;
          setTimeout(() => TrackPlayer.play(), 500);
        } else if (
          shouldPrompt &&
          !hasShownPrompt &&
          !isVoiceModeRef.current &&
          !forceRestart
        ) {
          hasShownPrompt = true;

          Alert.alert(
            'Resume Tilawat? 📖',
            `Aap pichli baar Ayat ${resumeIndex + 1} par thay.`,
            [
              {
                text: 'Shuru Se',
                onPress: async () => {
                  await TrackPlayer.skip(0);
                  setCurrentIndex(0);
                  currentIndexRef.current = 0;
                  await TrackPlayer.play();
                },
              },
              {
                text: 'Haan',
                onPress: async () => {
                  await TrackPlayer.skip(resumeIndex);
                  setCurrentIndex(resumeIndex);
                  currentIndexRef.current = resumeIndex;
                  await TrackPlayer.play();
                },
              },
            ],
            { cancelable: false },
          );
        } else if (resumeIndex > 0 && isVoiceModeRef.current && !forceRestart) {
          console.log(
            `🎙️ Voice mode: Auto-resuming from ayat ${resumeIndex + 1}`,
          );
          await TrackPlayer.skip(resumeIndex);
          setCurrentIndex(resumeIndex);
          currentIndexRef.current = resumeIndex;
          setTimeout(() => TrackPlayer.play(), 500);
        } else {
          console.log('🎵 Fresh start - playing from beginning');
          setTimeout(() => TrackPlayer.play(), 500);
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
      if (currentIndexRef.current > 0) {
        saveProgress(currentIndexRef.current, isVoiceModeRef.current);
      }
    };
  }, [playId, playType, playTitle, forceRestart, isResumeMode]);

  return {
    ayats,
    surahName,
    loading,
    currentIndex,
    isPlaying,
    isBuffering,
    progress,
    play,
    pause,
    next,
    previous,
    seekToTime,
    isVoiceMode,
  };
};
