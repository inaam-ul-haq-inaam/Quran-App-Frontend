import { useEffect, useState } from 'react';
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

const SURAH_NAMES = {
  1: 'Al-Fatiha',
  2: 'Al-Baqarah',
  36: 'Ya-Sin',
  55: 'Ar-Rahman',
  67: 'Al-Mulk',
};

export const useAudioPlayer = surahIdParam => {
  const [surahId, setSurahId] = useState(parseInt(surahIdParam));
  const [surahName, setSurahName] = useState('');
  const [ayats, setAyats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  const isPlaying = (playbackState.state || playbackState) === State.Playing;

  // Next Button Logic
  const handleNext = async () => {
    if (surahId < 114) {
      console.log('🔄 Button Next:', surahId + 1);
      setSurahId(prev => prev + 1);
    }
  };

  // Previous Button Logic
  const handlePrevious = async () => {
    if (surahId > 1) {
      console.log('🔄 Button Prev:', surahId - 1);
      setSurahId(prev => prev - 1);
    }
  };

  // 🔊 Player Setup & Data Load
  useEffect(() => {
    // 👇 FIX 1: Callback ko sahi tarah register karein with Logs
    const onVoiceCommand = newId => {
      console.log('🎤 Voice Command Received in Hook:', newId);
      setSurahId(newId);
    };
    PlayerService.registerCallback(onVoiceCommand);

    const load = async () => {
      try {
        setLoading(true);

        // 👇 FIX 2: Service ko batao k Current ID kya hai (BOHT ZAROORI)
        // Agar ye nahi karenge to Service purani ID par atka rahega
        console.log('📥 Syncing Service ID:', surahId);
        PlayerService.setSurahID(surahId);

        // Player Setup Check
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

        let data = await getSurahAyats(surahId);

        if (!data || data.length === 0) {
          console.log('No Data Found');
          setLoading(false);
          return;
        }

        // Fatiha Fix
        if (surahId === 1 && data.length > 7) {
          data = data.slice(0, 7);
        }

        // Bismillah Logic
        if (surahId !== 1 && surahId !== 9) {
          const first = data[0]?.ArabicText || '';
          if (!first.includes('بِسْمِ')) {
            data.unshift({
              AyatNumber: 0,
              ArabicText: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
            });
          } else {
            data[0].AyatNumber = 0;
          }
        }

        const name =
          data[0].NameEnglish.split('(')[0].trim() || `Surah ${surahId}`;
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
      PlayerService.registerCallback(null);
      TrackPlayer.stop();
    };
  }, [surahId]);

  // Track Index Listener
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

  return {
    ayats,
    surahName,
    loading,
    currentIndex,
    isPlaying,
    play: async () => await TrackPlayer.play(),
    pause: async () => await TrackPlayer.pause(),
    next: handleNext,
    previous: handlePrevious,
    seekToTime: async sec => await TrackPlayer.seekTo(sec),
    skipToAyat: async index => await TrackPlayer.skip(index),
  };
};
