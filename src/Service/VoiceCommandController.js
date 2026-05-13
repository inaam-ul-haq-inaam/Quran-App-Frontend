// ============================================================
// VOICE COMMAND CONTROLLER
// Responsible for: Receiving voice commands from backend
// and executing appropriate actions (play, pause, chain creation, bookmark, bayan, etc.)
// ============================================================

import { useCallback } from 'react';
import { ToastAndroid } from 'react-native';
import * as RootNavigation from '../navigation/RootNavigation';
import { BASE_URL } from '../Config/config';
import {
  getSurahAyats,
  getBayanData,
  getChainDetails,
  deleteChainByName,
  deleteAllChains,
} from './Api';
import PlayerService from './PlayerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';

export const useVoiceCommand = () => {
  // ============================================================
  // HELPER 1: Send action to newChain screen (nested navigation)
  // ============================================================
  const sendToChainScreen = (voiceAction, extraParams = {}) => {
    try {
      console.log('🎤 Sending to chain screen:', voiceAction, extraParams);
      RootNavigation.navigate('Chain', {
        screen: 'newChain',
        params: {
          voiceAction: voiceAction,
          ...extraParams,
        },
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
      ToastAndroid.show('Navigation failed', ToastAndroid.SHORT);
    }
  };

  // ============================================================
  // HELPER 2: Get Surah ID from Name (with mapping)
  // ============================================================
  const getSurahIdFromName = async surahName => {
    if (!surahName) return null;

    const surahMapping = {
      fatiha: 1,
      fatihah: 1,
      'al-fatiha': 1,
      fateha: 1,
      baqarah: 2,
      'al-baqarah': 2,
      bakara: 2,
      bakra: 2,
      rehman: 55,
      rahman: 55,
      'ar-rahman': 55,
      ikhlas: 112,
      'al-ikhlas': 112,
      nas: 114,
      'an-nas': 114,
      naas: 114,
      falaq: 113,
      'al-falaq': 113,
      falak: 113,
      mulk: 67,
      yasin: 36,
      yaseen: 36,
    };

    const normalizedName = surahName.toLowerCase().trim();

    if (surahMapping[normalizedName]) {
      return surahMapping[normalizedName];
    }

    try {
      const response = await fetch(`${BASE_URL}/searchSurah/${normalizedName}`);
      const data = await response.json();
      return data?.surahId || null;
    } catch (error) {
      console.error('Error finding surah:', error);
      return null;
    }
  };

  // ============================================================
  // HELPER 3: Get Total Ayats for Surah
  // ============================================================
  const getTotalAyats = async surahId => {
    if (!surahId) return 7;
    try {
      const response = await getSurahAyats(surahId);
      return response?.surah_total_ayats || 7;
    } catch (error) {
      console.error('Error getting total ayats:', error);
      return 7;
    }
  };

  // ============================================================
  // HELPER 4: Save Bookmark to Backend
  // ============================================================
  const saveBookmarkToBackend = async (surahId, fromAyat, toAyat, title) => {
    if (!surahId) {
      ToastAndroid.show('Invalid surah ID', ToastAndroid.SHORT);
      return false;
    }

    try {
      const payload = {
        profileid: 1,
        surahid: surahId,
        reciterid: 1,
        startayat: fromAyat || 1,
        endayat: toAyat || fromAyat || 1,
        title: title || `Surah ${surahId}`,
      };

      const response = await fetch(`${BASE_URL}/surahBookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.message === 'Surah Bookmarked succcess') {
        ToastAndroid.show(`✅ Bookmarked: ${title}`, ToastAndroid.SHORT);
        return true;
      } else if (data.message === 'Surah already Bookmarked') {
        ToastAndroid.show('Already bookmarked!', ToastAndroid.SHORT);
        return false;
      }
    } catch (error) {
      console.error('Save bookmark error:', error);
      ToastAndroid.show('Error saving bookmark', ToastAndroid.SHORT);
      return false;
    }
  };

  // ============================================================
  // HELPER 5: Play Surah by ID
  // ============================================================
  const playSurahById = async (
    surahId,
    fromAyat = 1,
    toAyat = null,
    isVoice = true,
  ) => {
    if (!surahId) {
      ToastAndroid.show('Invalid surah ID', ToastAndroid.SHORT);
      return false;
    }

    try {
      const surahData = await getSurahAyats(surahId);

      if (surahData?.ayats && surahData.ayats.length > 0) {
        let ayatsToPlay = surahData.ayats;

        // Filter range if specified
        if (fromAyat > 1 || toAyat) {
          const startIdx = fromAyat - 1;
          const endIdx = toAyat
            ? Math.min(surahData.ayats.length, toAyat) - 1
            : surahData.ayats.length - 1;
          ayatsToPlay = surahData.ayats.slice(startIdx, endIdx + 1);
        }

        RootNavigation.navigate('Quran', {
          screen: 'AudioPlayerScreen',
          params: {
            surah_ID: surahId,
            surahName: surahData.surah_name,
            surahArabicName: surahData.surah_name_arabic,
            reciterName: surahData.reciter_name,
            totalAyats: surahData.surah_total_ayats,
            data: ayatsToPlay,
            isVoiceCommand: isVoice,
            forceRestart: true,
            startFromAyat: fromAyat,
          },
        });

        await PlayerService.playSurah(surahId, ayatsToPlay, isVoice);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error playing surah:', error);
      ToastAndroid.show('Error playing surah', ToastAndroid.SHORT);
      return false;
    }
  };

  // ============================================================
  // MAIN HANDLE TOKEN - Backend se aaye token ko process karta hai
  // ============================================================
  const handleToken = useCallback(async (action, tokenData) => {
    console.log('🎯 Action Received:', action, 'Data:', tokenData);

    // Validation: Check if action exists
    if (!action) {
      console.log('⚠️ No action received');
      return;
    }

    const currentRoute = RootNavigation.getCurrentRoute();
    const currentScreen = currentRoute?.name;

    // ============================================================
    // SECTION 1: CHAIN CREATION COMMANDS
    // ============================================================

    // 1.1 - Open chain builder screen
    if (action === 'open_chain_builder') {
      console.log('🎤 Opening chain builder via voice');
      try {
        RootNavigation.navigate('Chain', { screen: 'newChain' });
        ToastAndroid.show('Opening chain builder', ToastAndroid.SHORT);
      } catch (error) {
        console.error('Navigation error:', error);
        ToastAndroid.show('Failed to open chain builder', ToastAndroid.SHORT);
      }
      return;
    }

    // 1.2 - Select surah for chain
    if (action === 'select_surah') {
      console.log('🎤 Select surah for chain:', tokenData?.surahName);
      if (tokenData?.surahName) {
        sendToChainScreen('select_surah', { surahName: tokenData.surahName });
      } else {
        ToastAndroid.show('Please say surah name', ToastAndroid.SHORT);
      }
      return;
    }

    // 1.3 - Select ayat for chain (single or range)
    if (action === 'select_ayat') {
      console.log(
        '🎤 Select ayat:',
        tokenData?.fromAyat,
        'to:',
        tokenData?.toAyat,
      );
      if (tokenData?.fromAyat) {
        sendToChainScreen('select_ayat', {
          fromAyat: tokenData.fromAyat,
          toAyat: tokenData.toAyat,
        });
      } else {
        ToastAndroid.show('Please say ayat number', ToastAndroid.SHORT);
      }
      return;
    }

    // 1.4 - Add current selection to chain list
    if (action === 'add_to_list') {
      console.log('🎤 Adding to chain list');
      sendToChainScreen('add_to_list');
      return;
    }

    // 1.5 - Set chain title
    if (action === 'set_title') {
      console.log('🎤 Setting chain title:', tokenData?.title);
      if (tokenData?.title) {
        sendToChainScreen('set_title', { title: tokenData.title });
      } else {
        ToastAndroid.show('Please say title name', ToastAndroid.SHORT);
      }
      return;
    }

    // 1.6 - Save chain
    if (action === 'save_chain') {
      console.log('🎤 Saving chain');
      sendToChainScreen('save_chain');
      return;
    }

    // 1.7 - Remove last item from chain
    if (action === 'remove_last') {
      console.log('🎤 Removing last item from chain');
      sendToChainScreen('remove_last');
      return;
    }

    // 1.8 - Clear all items from chain
    if (action === 'clear_all') {
      console.log('🎤 Clearing all chain items');
      sendToChainScreen('clear_all');
      return;
    }

    // 1.9 - Show current chain list
    if (action === 'show_list') {
      console.log('🎤 Showing chain list');
      sendToChainScreen('show_list');
      return;
    }

    // 1.10 - Cancel chain creation
    if (action === 'cancel_chain') {
      console.log('🎤 Cancelling chain creation');
      sendToChainScreen('cancel_chain');
      return;
    }

    if (action === 'delete_chain') {
      console.log('🎤 Deleting chain:', tokenData?.chainName);

      if (!tokenData?.chainName) {
        ToastAndroid.show('Please say chain name', ToastAndroid.SHORT);
        return;
      }

      try {
        const result = await deleteChainByName(tokenData.chainName);

        if (result.message.includes('successfully')) {
          ToastAndroid.show(
            `✅ Chain "${tokenData.chainName}" deleted`,
            ToastAndroid.SHORT,
          );
        } else {
          ToastAndroid.show(
            result.message || 'Chain not found',
            ToastAndroid.LONG,
          );
        }
      } catch (error) {
        console.error('Delete chain error:', error);
        ToastAndroid.show('Error deleting chain', ToastAndroid.SHORT);
      }
      return;
    }

    if (action === 'delete_all_chains') {
      console.log('🎤 Deleting all chains');

      Alert.alert(
        'Delete All Chains?',
        'Are you sure you want to delete ALL chains?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete All',
            style: 'destructive',
            onPress: async () => {
              const result = await deleteAllChains(1); // profileId
              if (result.message.includes('successfully')) {
                ToastAndroid.show('✅ All chains deleted', ToastAndroid.SHORT);
              } else {
                ToastAndroid.show('Error deleting chains', ToastAndroid.SHORT);
              }
            },
          },
        ],
      );
      return;
    }

    // ============================================================
    // SECTION 2: BOOKMARK COMMANDS
    // ============================================================

    // 2.1 - Bookmark full surah
    if (action === 'bookmark_surah') {
      console.log('🎤 Bookmark surah:', tokenData?.surahName);

      if (!tokenData?.surahName) {
        ToastAndroid.show('Please say surah name', ToastAndroid.SHORT);
        return;
      }

      const surahId = await getSurahIdFromName(tokenData.surahName);
      const surahName =
        tokenData.surahName.charAt(0).toUpperCase() +
        tokenData.surahName.slice(1);

      if (surahId) {
        const totalAyats = await getTotalAyats(surahId);
        await saveBookmarkToBackend(
          surahId,
          1,
          totalAyats,
          `${surahName} (Full)`,
        );
      } else {
        ToastAndroid.show(
          `Surah "${tokenData.surahName}" not found`,
          ToastAndroid.LONG,
        );
      }
      return;
    }

    // 2.2 - Bookmark specific ayat
    if (action === 'bookmark_ayat') {
      console.log(
        '🎤 Bookmark ayat:',
        tokenData?.surahName,
        '-',
        tokenData?.fromAyat,
      );

      if (!tokenData?.surahName || !tokenData?.fromAyat) {
        ToastAndroid.show(
          'Please say surah and ayat number',
          ToastAndroid.SHORT,
        );
        return;
      }

      const surahId = await getSurahIdFromName(tokenData.surahName);
      const surahName =
        tokenData.surahName.charAt(0).toUpperCase() +
        tokenData.surahName.slice(1);
      const ayatNum = tokenData.fromAyat;

      if (surahId) {
        await saveBookmarkToBackend(
          surahId,
          ayatNum,
          ayatNum,
          `${surahName} - Ayat ${ayatNum}`,
        );
      } else {
        ToastAndroid.show(
          `Surah "${tokenData.surahName}" not found`,
          ToastAndroid.LONG,
        );
      }
      return;
    }

    // 2.3 - Bookmark range
    if (action === 'bookmark_range') {
      console.log(
        '🎤 Bookmark range:',
        tokenData?.surahName,
        '-',
        tokenData?.fromAyat,
        'to',
        tokenData?.toAyat,
      );

      if (!tokenData?.surahName || !tokenData?.fromAyat) {
        ToastAndroid.show(
          'Please say surah and ayat range',
          ToastAndroid.SHORT,
        );
        return;
      }

      const surahId = await getSurahIdFromName(tokenData.surahName);
      const surahName =
        tokenData.surahName.charAt(0).toUpperCase() +
        tokenData.surahName.slice(1);

      if (surahId) {
        await saveBookmarkToBackend(
          surahId,
          tokenData.fromAyat,
          tokenData.toAyat || tokenData.fromAyat,
          `${surahName} - Ayat ${tokenData.fromAyat} to ${
            tokenData.toAyat || tokenData.fromAyat
          }`,
        );
      } else {
        ToastAndroid.show(
          `Surah "${tokenData.surahName}" not found`,
          ToastAndroid.LONG,
        );
      }
      return;
    }

    // 2.4 - Bookmark with custom title
    if (action === 'bookmark_with_title') {
      console.log(
        '🎤 Bookmark with title:',
        tokenData?.surahName,
        '-',
        tokenData?.title,
      );

      if (!tokenData?.surahName) {
        ToastAndroid.show('Please say surah name', ToastAndroid.SHORT);
        return;
      }

      const surahId = await getSurahIdFromName(tokenData.surahName);

      if (surahId) {
        await saveBookmarkToBackend(
          surahId,
          1,
          null,
          tokenData.title || `Surah ${surahId}`,
        );
      } else {
        ToastAndroid.show(
          `Surah "${tokenData.surahName}" not found`,
          ToastAndroid.LONG,
        );
      }
      return;
    }

    // 2.5 - Show bookmarks list
    if (action === 'show_bookmarks') {
      console.log('🎤 Showing bookmarks list');
      try {
        RootNavigation.navigate('BookmarkListScreen');
      } catch (error) {
        console.error('Navigation error:', error);
        ToastAndroid.show('Failed to open bookmarks', ToastAndroid.SHORT);
      }
      return;
    }

    // ============================================================
    // SECTION 3: PLAY CHAIN COMMANDS
    // ============================================================

    if (action === 'play_chain') {
      console.log('🎤 Playing chain:', tokenData?.chainName);

      if (!tokenData?.chainName) {
        ToastAndroid.show('Please say chain name', ToastAndroid.SHORT);
        return;
      }

      try {
        const chainDetails = await getChainDetails(tokenData.chainName);

        if (chainDetails && chainDetails.length > 0) {
          console.log('✅ Chain found, playing:', chainDetails.length, 'items');

          RootNavigation.navigate('Quran', {
            screen: 'AudioPlayerScreen',
            params: {
              type: 'chain',
              id: tokenData.chainName,
              title: tokenData.chainName,
              data: chainDetails,
              isVoiceCommand: true,
              forceRestart: true,
            },
          });

          setTimeout(() => {
            PlayerService.playSurah(
              chainDetails[0].surahId,
              chainDetails,
              true,
            );
          }, 500);

          ToastAndroid.show(
            '🎵 Playing: ' + tokenData.chainName,
            ToastAndroid.SHORT,
          );
        } else {
          console.log('❌ Chain not found:', tokenData.chainName);
          ToastAndroid.show(
            'Chain "' + tokenData.chainName + '" not found',
            ToastAndroid.LONG,
          );
        }
      } catch (error) {
        console.error('❌ Error playing chain:', error);
        ToastAndroid.show('Error playing chain', ToastAndroid.SHORT);
      }
      return;
    }

    // ============================================================
    // SECTION 4: RANGE PLAYBACK
    // ============================================================

    if (action === 'play_range') {
      console.log(
        '🎯 Range play detected:',
        tokenData?.from,
        'to',
        tokenData?.to,
        'Surah:',
        tokenData?.surah,
      );

      if (!tokenData?.surah) {
        ToastAndroid.show('Please say surah name', ToastAndroid.SHORT);
        return;
      }

      if (tokenData.type === 'surah' && tokenData.surah) {
        const surahData = await getSurahAyats(tokenData.surah);

        if (surahData?.ayats && surahData.ayats.length > 0) {
          let fromIdx, toIdx;

          if (tokenData.from && tokenData.to) {
            fromIdx = Math.max(0, tokenData.from - 1);
            toIdx = Math.min(surahData.ayats.length, tokenData.to) - 1;
          } else if (tokenData.from && !tokenData.to) {
            fromIdx = Math.max(0, tokenData.from - 1);
            toIdx = surahData.ayats.length - 1;
          } else if (!tokenData.from && tokenData.to) {
            fromIdx = 0;
            toIdx = Math.min(surahData.ayats.length, tokenData.to) - 1;
          } else {
            fromIdx = 0;
            toIdx = surahData.ayats.length - 1;
          }

          const rangeAyats = surahData.ayats.slice(fromIdx, toIdx + 1);

          if (rangeAyats.length > 0) {
            RootNavigation.navigate('Quran', {
              screen: 'AudioPlayerScreen',
              params: {
                surah_ID: tokenData.surah,
                surahName: surahData.surah_name,
                surahArabicName: surahData.surah_name_arabic,
                reciterName: surahData.reciter_name,
                totalAyats: surahData.surah_total_ayats,
                data: rangeAyats,
                isRangePlay: true,
                forceRestart: true,
              },
            });

            setTimeout(() => {
              PlayerService.playSurah(tokenData.surah, rangeAyats, true);
            }, 500);

            ToastAndroid.show(
              `Playing ayats ${fromIdx + 1} to ${toIdx + 1}`,
              ToastAndroid.SHORT,
            );
          }
        }
      }
      return;
    }

    // ============================================================
    // SECTION 5: NEXT/PREVIOUS SURAH NAVIGATION
    // ============================================================

    // 5.1 - Next Surah Command
    if (action === 'next_surah') {
      console.log('🎤 Next surah command');

      try {
        const currentSurahId = PlayerService.getCurrentSurahId();
        if (!currentSurahId) {
          ToastAndroid.show(
            'No surah is currently playing',
            ToastAndroid.SHORT,
          );
          return;
        }

        const nextSurahId = currentSurahId + 1;
        if (nextSurahId > 114) {
          ToastAndroid.show('This is the last surah', ToastAndroid.SHORT);
          return;
        }

        const success = await playSurahById(nextSurahId, 1, null, true);
        if (success) {
          ToastAndroid.show(`Playing next surah`, ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Failed to load next surah', ToastAndroid.SHORT);
        }
      } catch (error) {
        console.error('Next surah error:', error);
        ToastAndroid.show('Error playing next surah', ToastAndroid.SHORT);
      }
      return;
    }

    // 5.2 - Previous Surah Command
    if (action === 'previous_surah') {
      console.log('🎤 Previous surah command');

      try {
        const currentSurahId = PlayerService.getCurrentSurahId();
        if (!currentSurahId) {
          ToastAndroid.show(
            'No surah is currently playing',
            ToastAndroid.SHORT,
          );
          return;
        }

        const prevSurahId = currentSurahId - 1;
        if (prevSurahId < 1) {
          ToastAndroid.show('This is the first surah', ToastAndroid.SHORT);
          return;
        }

        const success = await playSurahById(prevSurahId, 1, null, true);
        if (success) {
          ToastAndroid.show(`Playing previous surah`, ToastAndroid.SHORT);
        } else {
          ToastAndroid.show(
            'Failed to load previous surah',
            ToastAndroid.SHORT,
          );
        }
      } catch (error) {
        console.error('Previous surah error:', error);
        ToastAndroid.show('Error playing previous surah', ToastAndroid.SHORT);
      }
      return;
    }

    // ============================================================
    // SECTION 6: STANDARD PLAYER CONTROLS
    // ============================================================

    switch (action?.toLowerCase()) {
      // 6.1 - PLAY COMMAND
      case 'play':
        console.log('🎤 Play command - Starting from beginning');

        if (tokenData?.type === 'chain') {
          if (!tokenData?.chainName) {
            ToastAndroid.show('Please say chain name', ToastAndroid.SHORT);
            return;
          }
          const chainDetails = await getChainDetails(tokenData.chainName);
          if (chainDetails?.length > 0) {
            RootNavigation.navigate('Quran', {
              screen: 'AudioPlayerScreen',
              params: {
                type: 'chain',
                id: tokenData.chainName,
                title: tokenData.chainName,
                data: chainDetails,
                isVoiceCommand: true,
                forceRestart: true,
              },
            });
            setTimeout(() => {
              PlayerService.playSurah(
                chainDetails[0].surahId,
                chainDetails,
                true,
              );
            }, 500);
          } else {
            ToastAndroid.show('Chain not found', ToastAndroid.SHORT);
          }
          return;
        }

        // ============================================================
        // 🔥 BAYAN PLAY COMMAND - FIXED with stopAndReset and forceRestart
        // ============================================================
        // In the bayan play handler, before fetching new data:

        if (tokenData?.type === 'bayan') {
          console.log('🎤 Playing bayan for surah:', tokenData?.surahId);

          if (!tokenData?.surahId) {
            ToastAndroid.show('Please say surah name', ToastAndroid.SHORT);
            return;
          }

          try {
            await PlayerService.setupPlayer();
            // 🔥 Stop and reset player
            await PlayerService.stopAndReset();

            // 🔥 Add small delay to ensure reset completes
            await new Promise(resolve => setTimeout(resolve, 100));

            // 🔥 Fetch fresh data (bypass any cache)
            const bayanList = await getBayanData(tokenData.surahId);

            console.log('📡 Fetched bayan list:', bayanList?.length);

            if (bayanList && bayanList.length > 0) {
              const bayanIndex = tokenData.bayanIndex || 0;
              const validIndex = bayanIndex < bayanList.length ? bayanIndex : 0;

              // 🔥 Log the first bayan title to verify it's different
              console.log('🎤 First bayan title:', bayanList[0]?.Title);

              RootNavigation.navigate('Bayan', {
                screen: 'BayanPlayer',
                params: {
                  bayanList: JSON.parse(JSON.stringify(bayanList)), // 🔥 Deep copy to break reference
                  initialIndex: validIndex,
                  isVoiceCommand: true,
                  forceRestart: true,
                },
              });
            } else {
              ToastAndroid.show(
                'No bayan found for this surah',
                ToastAndroid.LONG,
              );
            }
          } catch (error) {
            console.error('Bayan play error:', error);
            ToastAndroid.show('Error playing bayan', ToastAndroid.SHORT);
          }
          return;
        }
        if (tokenData?.surah) {
          await playSurahById(
            tokenData.surah,
            tokenData.from || 1,
            tokenData.to || null,
            true,
          );
        } else {
          ToastAndroid.show('Please say surah name', ToastAndroid.SHORT);
        }
        break;

      // 6.2 - RESUME COMMAND
      case 'resume':
        console.log('🎤 Resume command');
        try {
          const queue = await TrackPlayer.getQueue();
          const currentTrack = await TrackPlayer.getActiveTrackIndex();

          if (queue && queue.length > 0 && currentTrack !== null) {
            await TrackPlayer.play();
            ToastAndroid.show('Resuming...', ToastAndroid.SHORT);
            return;
          }

          const lastSurahId = await AsyncStorage.getItem('last_played_surah');
          if (lastSurahId) {
            const surahData = await getSurahAyats(parseInt(lastSurahId));
            if (surahData?.ayats && surahData.ayats.length > 0) {
              const resumeKey = `resume_surah_${lastSurahId}`;
              const savedProgress = await AsyncStorage.getItem(resumeKey);
              const savedIndex = savedProgress ? parseInt(savedProgress) : 0;

              RootNavigation.navigate('Quran', {
                screen: 'AudioPlayerScreen',
                params: {
                  surah_ID: parseInt(lastSurahId),
                  surahName: surahData.surah_name,
                  surahArabicName: surahData.surah_name_arabic,
                  reciterName: surahData.reciter_name,
                  totalAyats: surahData.surah_total_ayats,
                  data: surahData.ayats,
                  isVoiceCommand: true,
                  isResume: true,
                  resumeFromAyat: savedIndex + 1,
                },
              });
              await PlayerService.playSurah(
                parseInt(lastSurahId),
                surahData.ayats,
                true,
              );
              if (savedIndex > 0) {
                ToastAndroid.show(
                  `Resuming from ayat ${savedIndex + 1}`,
                  ToastAndroid.LONG,
                );
              }
              return;
            }
          }
          ToastAndroid.show('No surah to resume', ToastAndroid.LONG);
        } catch (error) {
          console.error('Resume error:', error);
          ToastAndroid.show('Resume failed', ToastAndroid.SHORT);
        }
        break;

      // 6.3 - PAUSE COMMAND
      case 'pause':
        console.log('🎤 Pause command');
        try {
          await PlayerService.pause();
          ToastAndroid.show('Paused', ToastAndroid.SHORT);
        } catch (error) {
          console.error('Pause error:', error);
          ToastAndroid.show('Pause failed', ToastAndroid.SHORT);
        }
        break;

      // 6.4 - NEXT COMMAND (Next Ayat)
      case 'next':
        console.log('🎤 Next command');
        try {
          if (currentScreen === 'BayanPlayer') {
            PlayerService.nextBayan(true);
          } else {
            PlayerService.next(true);
          }
          ToastAndroid.show('Next', ToastAndroid.SHORT);
        } catch (error) {
          console.error('Next error:', error);
          ToastAndroid.show('Next failed', ToastAndroid.SHORT);
        }
        break;

      // 6.5 - PREVIOUS COMMAND (Previous Ayat)
      case 'previous':
        console.log('🎤 Previous command');
        try {
          if (currentScreen === 'BayanPlayer') {
            PlayerService.previousBayan(true);
          } else {
            PlayerService.previous(true);
          }
          ToastAndroid.show('Previous', ToastAndroid.SHORT);
        } catch (error) {
          console.error('Previous error:', error);
          ToastAndroid.show('Previous failed', ToastAndroid.SHORT);
        }
        break;

      // 6.6 - STOP COMMAND
      case 'stop':
        console.log('🎤 Stop command');
        try {
          await TrackPlayer.stop();
          await TrackPlayer.seekTo(0);
          ToastAndroid.show('Stopped', ToastAndroid.SHORT);
        } catch (error) {
          console.error('Stop error:', error);
          ToastAndroid.show('Stop failed', ToastAndroid.SHORT);
        }
        break;

      // 6.7 - UNKNOWN COMMAND
      default:
        console.log('⚠️ Unknown command:', action);
        ToastAndroid.show('Command not recognized', ToastAndroid.SHORT);
    }
  }, []);

  // ============================================================
  // PROCESS COMMAND - Sends voice text to backend and receives token
  // ============================================================
  const processCommand = useCallback(
    async text => {
      console.log('🔥 VOICE_COMMAND_RECEIVED:', text);

      // Validation
      if (!text || typeof text !== 'string') {
        console.log('⚠️ Invalid voice text received');
        ToastAndroid.show('Please speak clearly', ToastAndroid.SHORT);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/voice/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.toLowerCase().trim() }),
        });

        const data = await response.json();
        console.log('🤖 Backend Response:', data);

        if (data?.token) {
          handleToken(data.token.player, data.token);
        } else {
          console.log('⚠️ No token in response');
          ToastAndroid.show('Command not understood', ToastAndroid.SHORT);
        }
      } catch (error) {
        console.log('❌ API Error:', error);
        ToastAndroid.show(
          'Voice command failed. Check connection.',
          ToastAndroid.LONG,
        );
      }
    },
    [handleToken],
  );

  // ============================================================
  // RETURN
  // ============================================================
  return { processCommand };
};
