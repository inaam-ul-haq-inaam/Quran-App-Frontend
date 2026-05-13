// ============================================================
// useAudioPlayer.js - COMPLETE WORKING CODE (FIXED)
// Handles: Quran Audio Playback, Chain Playback, Voice Commands,
//          Progress Save/Resume, Force Restart, Range Playback,
//          Next/Previous Surah Navigation
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Platform, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native'; // 👈 IMPORT ADD KARO
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

// ============================================================
// MAIN HOOK
// ============================================================
export const useAudioPlayer = (playType, playId, playTitle) => {
  // 👇 ROUTE PARAMS READ KARO
  const route = useRoute();
  const params = route.params || {};

  // ============================================================
  // STATE VARIABLES
  // ============================================================

  // Audio data states
  const [ayats, setAyats] = useState([]);
  const [surahName, setSurahName] = useState(playTitle);
  const [surahArabicName, setSurahArabicName] = useState('');
  const [reciterName, setReciterName] = useState('');
  const [totalAyats, setTotalAyats] = useState(0);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(0);

  // Player states - 👇 PARAMS SE VALUE LO
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(
    params.isVoiceCommand || false,
  );
  const [forceRestart, setForceRestart] = useState(
    params.forceRestart || false,
  );
  const [isResumeMode, setIsResumeMode] = useState(params.isResume || false);
  const [resumeFromAyat, setResumeFromAyat] = useState(
    params.resumeFromAyat || null,
  );

  // Refs for tracking without re-renders
  const currentIndexRef = useRef(0);
  const isVoiceModeRef = useRef(isVoiceMode);
  const currentIdRef = useRef(playId);

  // TrackPlayer hooks
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Derived states
  const isPlaying =
    playbackState?.state === State.Playing || playbackState === State.Playing;
  const isBuffering =
    playbackState?.state === State.Buffering ||
    playbackState === State.Buffering;

  // Update ref when isVoiceMode changes
  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  // ============================================================
  // HELPER: Save Progress to AsyncStorage
  // ============================================================
  const saveProgress = useCallback(
    async (index, isVoice = false) => {
      if (!index || index <= 0) return;

      try {
        const key = isVoice
          ? `voice_resume_${playType}_${playId}`
          : `resume_${playType}_${playId}`;
        await AsyncStorage.setItem(key, index.toString());
        console.log(`💾 Saved: ${key} = ${index}`);
      } catch (error) {
        console.error('Save progress error:', error);
      }
    },
    [playType, playId],
  );

  // ============================================================
  // HELPER: Get Resume Index from AsyncStorage
  // ============================================================
  const getResumeIndexSilent = useCallback(
    async isVoice => {
      try {
        const key = isVoice
          ? `voice_resume_${playType}_${playId}`
          : `resume_${playType}_${playId}`;
        const savedValue = await AsyncStorage.getItem(key);
        const index = savedValue ? parseInt(savedValue) : 0;
        console.log(
          `📖 Resume check (${isVoice ? 'voice' : 'manual'}):`,
          index,
        );
        return index;
      } catch (error) {
        console.error('Get resume index error:', error);
        return 0;
      }
    },
    [playType, playId],
  );

  // ============================================================
  // HELPER: Check if should show resume prompt
  // ============================================================
  const shouldShowResumePrompt = useCallback(async () => {
    if (forceRestart) return false;
    if (isVoiceModeRef.current) return false;

    try {
      const key = `resume_${playType}_${playId}`;
      const savedValue = await AsyncStorage.getItem(key);
      return savedValue !== null && parseInt(savedValue) > 0;
    } catch (error) {
      console.error('Check resume prompt error:', error);
      return false;
    }
  }, [playType, playId, forceRestart]);

  // ============================================================
  // PLAYER CONTROLS (same as before)
  // ============================================================

  const play = async () => {
    try {
      await TrackPlayer.play();
      console.log('▶️ Play command sent');
      ToastAndroid.show('Playing', ToastAndroid.SHORT);
    } catch (e) {
      console.error('Play Error:', e);
      ToastAndroid.show('Play failed', ToastAndroid.SHORT);
    }
  };

  const pause = async () => {
    try {
      await TrackPlayer.pause();
      console.log('⏸️ Pause command sent');
      ToastAndroid.show('Paused', ToastAndroid.SHORT);
    } catch (e) {
      console.error('Pause Error:', e);
      ToastAndroid.show('Pause failed', ToastAndroid.SHORT);
    }
  };

  const next = async () => {
    try {
      const queue = await TrackPlayer.getQueue();
      const currentTrack = await TrackPlayer.getActiveTrackIndex();

      if (!queue || queue.length === 0) {
        console.log('⚠️ No queue available');
        ToastAndroid.show('Nothing to play', ToastAndroid.SHORT);
        return;
      }

      if (currentTrack !== null && currentTrack < queue.length - 1) {
        await TrackPlayer.skipToNext();
        console.log('⏭️ Next ayat');
        ToastAndroid.show('Next Ayat', ToastAndroid.SHORT);
        return;
      }

      if (playType === 'surah' && parseInt(playId) < 114) {
        const nextId = parseInt(playId) + 1;
        const nextData = await getSurahAyats(nextId);

        if (nextData?.ayats && nextData.ayats.length > 0) {
          console.log(`⏭️ Moving to next surah: ${nextId}`);
          await PlayerService.playSurah(
            nextId,
            nextData.ayats,
            isVoiceModeRef.current,
          );
          ToastAndroid.show(`Surah ${nextData.surah_name}`, ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('No more surahs', ToastAndroid.SHORT);
        }
        return;
      }

      await TrackPlayer.skip(0);
      console.log('🔄 Looping to first ayat');
      ToastAndroid.show('Start of Surah', ToastAndroid.SHORT);
    } catch (e) {
      console.error('Next Error:', e);
      ToastAndroid.show('Next failed', ToastAndroid.SHORT);
    }
  };

  const previous = async () => {
    try {
      const currentTrack = await TrackPlayer.getActiveTrackIndex();
      const position = await TrackPlayer.getPosition();

      if (currentTrack === null) {
        console.log('⚠️ No track playing');
        return;
      }

      if (position < 3 && currentTrack > 0) {
        await TrackPlayer.skipToPrevious();
        console.log('⏮️ Previous ayat');
        ToastAndroid.show('Previous Ayat', ToastAndroid.SHORT);
        return;
      }

      if (
        currentTrack === 0 &&
        position < 3 &&
        playType === 'surah' &&
        parseInt(playId) > 1
      ) {
        const prevId = parseInt(playId) - 1;
        const prevData = await getSurahAyats(prevId);

        if (prevData?.ayats && prevData.ayats.length > 0) {
          console.log(`⏮️ Moving to previous surah: ${prevId}`);
          await PlayerService.playSurah(
            prevId,
            prevData.ayats,
            isVoiceModeRef.current,
          );
          ToastAndroid.show(`Surah ${prevData.surah_name}`, ToastAndroid.SHORT);
        }
        return;
      }

      await TrackPlayer.seekTo(0);
      console.log('⏮️ Seek to start of current ayat');
      ToastAndroid.show('Start of Ayat', ToastAndroid.SHORT);
    } catch (e) {
      console.error('Previous Error:', e);
      ToastAndroid.show('Previous failed', ToastAndroid.SHORT);
    }
  };

  const nextSurah = async () => {
    try {
      const currentId = parseInt(playId);
      if (currentId < 114) {
        const nextId = currentId + 1;
        const nextData = await getSurahAyats(nextId);

        if (nextData?.ayats && nextData.ayats.length > 0) {
          console.log(`⏭️ Next surah: ${nextId}`);
          await PlayerService.playSurah(
            nextId,
            nextData.ayats,
            isVoiceModeRef.current,
          );
          ToastAndroid.show(`Surah ${nextData.surah_name}`, ToastAndroid.SHORT);
          return true;
        }
      }
      ToastAndroid.show('This is the last surah', ToastAndroid.SHORT);
      return false;
    } catch (e) {
      console.error('Next Surah Error:', e);
      ToastAndroid.show('Failed to load next surah', ToastAndroid.SHORT);
      return false;
    }
  };

  const previousSurah = async () => {
    try {
      const currentId = parseInt(playId);
      if (currentId > 1) {
        const prevId = currentId - 1;
        const prevData = await getSurahAyats(prevId);

        if (prevData?.ayats && prevData.ayats.length > 0) {
          console.log(`⏮️ Previous surah: ${prevId}`);
          await PlayerService.playSurah(
            prevId,
            prevData.ayats,
            isVoiceModeRef.current,
          );
          ToastAndroid.show(`Surah ${prevData.surah_name}`, ToastAndroid.SHORT);
          return true;
        }
      }
      ToastAndroid.show('This is the first surah', ToastAndroid.SHORT);
      return false;
    } catch (e) {
      console.error('Previous Surah Error:', e);
      ToastAndroid.show('Failed to load previous surah', ToastAndroid.SHORT);
      return false;
    }
  };

  const seekToTime = async seconds => {
    try {
      if (isNaN(seconds) || seconds < 0) return;
      await TrackPlayer.seekTo(seconds);
      console.log(`⏩ Seeked to: ${seconds}s`);
    } catch (e) {
      console.log('Seek Error:', e);
    }
  };

  // ============================================================
  // TRACK CHANGE LISTENER
  // ============================================================
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async event => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.index !== null &&
      event.index !== undefined
    ) {
      setCurrentIndex(event.index);
      currentIndexRef.current = event.index;
      await saveProgress(event.index, isVoiceModeRef.current);

      if (playType === 'surah') {
        await AsyncStorage.setItem('last_played_surah', playId.toString());
      }
    }
  });

  // ============================================================
  // VOICE COMMAND CALLBACK HANDLER
  // ============================================================
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

      if (rangeFrom || rangeTo) {
        const ayatsData = await getSurahAyats(newId);
        if (ayatsData?.ayats && ayatsData.ayats.length > 0) {
          let filteredAyats = [...ayatsData.ayats];
          if (rangeFrom && rangeTo) {
            filteredAyats = ayatsData.ayats.slice(rangeFrom - 1, rangeTo);
          } else if (rangeFrom) {
            filteredAyats = [ayatsData.ayats[rangeFrom - 1]];
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

  // ============================================================
  // MAIN DATA LOADER
  // ============================================================
  useEffect(() => {
    let isMounted = true;
    let hasShownPrompt = false;

    const initPlayer = async () => {
      try {
        setLoading(true);

        // Setup TrackPlayer
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

        // Clear saved progress if forceRestart
        if (forceRestart) {
          const key = `resume_${playType}_${playId}`;
          const voiceKey = `voice_resume_${playType}_${playId}`;
          await AsyncStorage.removeItem(key);
          await AsyncStorage.removeItem(voiceKey);
          console.log('🔄 Force restart - cleared saved progress');
        }

        // Fetch data
        let data = null;
        let name = playTitle;

        if (playType === 'chain') {
          data = await getChainDetails(playId);
          if (data && data.length > 0) {
            setAyats(data);
          }
        } else {
          const response = await getSurahAyats(playId);

          if (response && response.ayats && response.ayats.length > 0) {
            data = response.ayats;
            name = response.surah_name
              ? response.surah_name.split('(')[0].trim()
              : playTitle;

            setSurahName(response.surah_name || playTitle);
            setSurahArabicName(response.surah_name_arabic || '');
            setReciterName(response.reciter_name || 'Mishary Al-Afasy');
            setTotalAyats(response.surah_total_ayats || 0);
            setRangeFrom(response.range_from || 1);
            setRangeTo(
              response.range_to || response.surah_total_ayats || data.length,
            );

            PlayerService.setSurahID(playId);
          }
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
          id: (ayat.number || ayat.ayatNumber || idx + 1).toString(),
          url: ayat.audio || ayat.audioUrl || ayat.url,
          title: `Ayat ${ayat.number || ayat.ayatNumber || idx + 1}`,
          artist: name,
        }));

        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);

        // Handle resume logic
        const shouldPrompt = await shouldShowResumePrompt();
        let resumeIndex = await getResumeIndexSilent(isVoiceModeRef.current);

        if (resumeFromAyat && resumeFromAyat > 0) {
          resumeIndex = resumeFromAyat - 1;
          console.log(`📖 Resuming from specific ayat: ${resumeFromAyat}`);
        }

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
  }, [playId, playType, playTitle, forceRestart, isResumeMode, resumeFromAyat]);

  // ============================================================
  // RETURN
  // ============================================================
  return {
    ayats,
    surahName,
    surahArabicName,
    reciterName,
    totalAyats,
    rangeFrom,
    rangeTo,
    loading,
    currentIndex,
    isPlaying,
    isBuffering,
    progress,
    play,
    pause,
    next,
    previous,
    nextSurah,
    previousSurah,
    seekToTime,
    isVoiceMode,
  };
};
