// useAudioPlayer.js

import { useEffect, useState, useRef } from 'react';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  Event,
  useProgress,
} from 'react-native-track-player';

import { getSurahAyats } from '../../Service/Api';
import PlayerService from '../../Service/PlayerService';
import { preparePlayerQueue } from './QueuePlayer';

export const useAudioPlayer = surahIdParam => {
  const [surahId, setSurahId] = useState(parseInt(surahIdParam));
  const [surahName, setSurahName] = useState('');
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  const isPlaying = (playbackState.state || playbackState) === State.Playing;

  // 🔥 IMPORTANT: Skip flag to prevent duplicate fetch
  const skipFetchRef = useRef(false);

  // ===============================
  // Next / Previous Buttons
  // ===============================

  const handleNext = async () => {
    if (surahId < 114) {
      console.log('🔄 Button Next:', surahId + 1);
      setSurahId(prev => prev + 1);
    }
  };

  const handlePrevious = async () => {
    if (surahId > 1) {
      console.log('🔄 Button Prev:', surahId - 1);
      setSurahId(prev => prev - 1);
    }
  };

  // ===============================
  // Voice Callback Registration
  // ===============================

  useEffect(() => {
    const onVoiceCommand = (newId, skipFetch = false) => {
      console.log('🎤 Voice Command Received in Hook:', newId);

      if (skipFetch) {
        skipFetchRef.current = true; // prevent duplicate API call
      }

      setSurahId(newId);
    };

    PlayerService.registerCallback(onVoiceCommand);

    return () => {
      PlayerService.registerCallback(null);
    };
  }, []);

  // ===============================
  // Load Surah (Only When Needed)
  // ===============================

  useEffect(() => {
    const load = async () => {
      try {
        // 🚫 If voice already fetched ayats, skip fetching
        if (skipFetchRef.current) {
          console.log('⏭ Skipping fetch (voice already handled)');
          skipFetchRef.current = false;
          return;
        }

        setLoading(true);

        console.log('📥 Syncing Service ID:', surahId);
        PlayerService.setSurahID(surahId);

        // Ensure Player Setup
        try {
          await TrackPlayer.getActiveTrackIndex();
        } catch {
          await TrackPlayer.setupPlayer();
          await TrackPlayer.updateOptions({
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
            ],
          });
        }

        // 🔥 Fetch Full Surah (for Next/Previous button)
        let data = await getSurahAyats(surahId);

        if (!data || data.length === 0) {
          console.log('No Data Found');
          setLoading(false);
          return;
        }

        const name =
          data[0]?.NameEnglish?.split('(')[0]?.trim() || `Surah ${surahId}`;

        setSurahName(name);
        setAyats(data);

        await preparePlayerQueue(data, surahId, name);
      } catch (error) {
        console.error('Error loading Audio Player:', error);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      TrackPlayer.stop();
    };
  }, [surahId]);

  // ===============================
  // Track Index Listener
  // ===============================

  useEffect(() => {
    const sub = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      e => {
        if (e.index !== undefined) {
          setCurrentIndex(e.index);
        }
      },
    );

    return () => sub.remove();
  }, []);

  // ===============================
  // Return Controls
  // ===============================

  return {
    ayats,
    surahName,
    loading,
    currentIndex,
    isPlaying,
    progress,
    play: async () => await TrackPlayer.play(),
    pause: async () => await TrackPlayer.pause(),
    next: handleNext,
    previous: handlePrevious,
    seekToTime: async sec => await TrackPlayer.seekTo(sec),
    skipToAyat: async index => await TrackPlayer.skip(index),
  };
};
