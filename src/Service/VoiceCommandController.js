// voicecommandcontroller.js - COMPLETE WITH PLAY/RESUME SEPARATION

import { useCallback } from 'react';
import { ToastAndroid } from 'react-native';
import * as RootNavigation from '../navigation/RootNavigation';
import { BASE_URL } from '../Config/config';
import { getSurahAyats, getBayanData, getChainDetails } from './Api';
import PlayerService from './PlayerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer from 'react-native-track-player';

export const useVoiceCommand = () => {
  // ============================================================
  // HELPER: Send action to newChain screen
  // ============================================================
  const sendToChainScreen = (voiceAction, extraParams = {}) => {
    console.log('🎤 Sending to chain screen:', voiceAction, extraParams);
    RootNavigation.navigate('Chain', {
      screen: 'newChain',
      params: {
        voiceAction: voiceAction,
        ...extraParams,
      },
    });
  };

  // ============================================================
  // HELPER: Get Surah ID from Name
  // ============================================================
  const getSurahIdFromName = async surahName => {
    const surahMapping = {
      fatiha: 1,
      fatihah: 1,
      'al-fatiha': 1,
      baqarah: 2,
      'al-baqarah': 2,
      rehman: 55,
      rahman: 55,
      'ar-rahman': 55,
      ikhlas: 112,
      'al-ikhlas': 112,
      nas: 114,
      'an-nas': 114,
      falaq: 113,
      'al-falaq': 113,
    };

    if (surahMapping[surahName]) {
      return surahMapping[surahName];
    }

    try {
      const response = await fetch(`${BASE_URL}/searchSurah/${surahName}`);
      const data = await response.json();
      return data?.surahId || null;
    } catch (error) {
      console.error('Error finding surah:', error);
      return null;
    }
  };

  // ============================================================
  // HELPER: Get Total Ayats for Surah
  // ============================================================
  const getTotalAyats = async surahId => {
    const ayats = await getSurahAyats(surahId);
    return ayats?.length || 7;
  };

  // ============================================================
  // HELPER: Save Bookmark to Backend
  // ============================================================
  const saveBookmarkToBackend = async (surahId, fromAyat, toAyat, title) => {
    try {
      const payload = {
        profileid: 1,
        surahid: surahId,
        reciterid: 1,
        startayat: fromAyat,
        endayat: toAyat || fromAyat,
        title: title,
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
  // HANDLE TOKEN
  // ============================================================
  const handleToken = useCallback(async (action, tokenData) => {
    console.log('🎯 Action Received:', action, 'Data:', tokenData);

    const currentRoute = RootNavigation.getCurrentRoute();
    const currentScreen = currentRoute?.name;

    // ============================================================
    // SECTION 1: CHAIN CREATION COMMANDS
    // ============================================================

    if (action === 'open_chain_builder') {
      console.log('🎤 Opening chain builder via voice');
      RootNavigation.navigate('Chain', { screen: 'newChain' });
      return;
    }

    if (action === 'select_surah') {
      console.log('🎤 Select surah for chain:', tokenData.surahName);
      sendToChainScreen('select_surah', { surahName: tokenData.surahName });
      return;
    }

    if (action === 'select_ayat') {
      console.log(
        '🎤 Select ayat:',
        tokenData.fromAyat,
        'to:',
        tokenData.toAyat,
      );
      sendToChainScreen('select_ayat', {
        fromAyat: tokenData.fromAyat,
        toAyat: tokenData.toAyat,
      });
      return;
    }

    if (action === 'add_to_list') {
      console.log('🎤 Adding to chain list');
      sendToChainScreen('add_to_list');
      return;
    }

    if (action === 'set_title') {
      console.log('🎤 Setting chain title:', tokenData.title);
      sendToChainScreen('set_title', { title: tokenData.title });
      return;
    }

    if (action === 'save_chain') {
      console.log('🎤 Saving chain');
      sendToChainScreen('save_chain');
      return;
    }

    if (action === 'remove_last') {
      console.log('🎤 Removing last item from chain');
      sendToChainScreen('remove_last');
      return;
    }

    if (action === 'clear_all') {
      console.log('🎤 Clearing all chain items');
      sendToChainScreen('clear_all');
      return;
    }

    if (action === 'show_list') {
      console.log('🎤 Showing chain list');
      sendToChainScreen('show_list');
      return;
    }

    if (action === 'cancel_chain') {
      console.log('🎤 Cancelling chain creation');
      sendToChainScreen('cancel_chain');
      return;
    }

    // ============================================================
    // SECTION 2: BOOKMARK COMMANDS
    // ============================================================

    if (action === 'bookmark_surah') {
      console.log('🎤 Bookmark surah:', tokenData.surahName);

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

    if (action === 'bookmark_ayat') {
      console.log(
        '🎤 Bookmark ayat:',
        tokenData.surahName,
        '-',
        tokenData.fromAyat,
      );

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

    if (action === 'bookmark_range') {
      console.log(
        '🎤 Bookmark range:',
        tokenData.surahName,
        '-',
        tokenData.fromAyat,
        'to',
        tokenData.toAyat,
      );

      const surahId = await getSurahIdFromName(tokenData.surahName);
      const surahName =
        tokenData.surahName.charAt(0).toUpperCase() +
        tokenData.surahName.slice(1);

      if (surahId) {
        await saveBookmarkToBackend(
          surahId,
          tokenData.fromAyat,
          tokenData.toAyat,
          `${surahName} - Ayat ${tokenData.fromAyat} to ${tokenData.toAyat}`,
        );
      } else {
        ToastAndroid.show(
          `Surah "${tokenData.surahName}" not found`,
          ToastAndroid.LONG,
        );
      }
      return;
    }

    if (action === 'bookmark_with_title') {
      console.log(
        '🎤 Bookmark with title:',
        tokenData.surahName,
        '-',
        tokenData.title,
      );

      const surahId = await getSurahIdFromName(tokenData.surahName);

      if (surahId) {
        await saveBookmarkToBackend(surahId, 1, null, tokenData.title);
      } else {
        ToastAndroid.show(
          `Surah "${tokenData.surahName}" not found`,
          ToastAndroid.LONG,
        );
      }
      return;
    }

    if (action === 'show_bookmarks') {
      console.log('🎤 Showing bookmarks list');
      RootNavigation.navigate('BookmarkListScreen');
      return;
    }

    // ============================================================
    // SECTION 3: PLAY CHAIN
    // ============================================================

    if (action === 'play_chain') {
      console.log('🎤 Playing chain:', tokenData.chainName);

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
    // SECTION 4: RANGE PLAYBACK (4 PATTERNS)
    // ============================================================

    if (action === 'play_range') {
      console.log(
        '🎯 Range play detected:',
        tokenData.from,
        'to',
        tokenData.to,
        'Surah:',
        tokenData.surah,
      );

      if (tokenData.type === 'surah' && tokenData.surah) {
        const ayats = await getSurahAyats(tokenData.surah);

        if (ayats?.length > 0) {
          let fromIdx, toIdx;

          if (tokenData.from && tokenData.to) {
            fromIdx = Math.max(0, tokenData.from - 1);
            toIdx = Math.min(ayats.length, tokenData.to) - 1;
          } else if (tokenData.from && !tokenData.to) {
            fromIdx = Math.max(0, tokenData.from - 1);
            toIdx = ayats.length - 1;
          } else if (!tokenData.from && tokenData.to) {
            fromIdx = 0;
            toIdx = Math.min(ayats.length, tokenData.to) - 1;
          } else {
            fromIdx = 0;
            toIdx = ayats.length - 1;
          }

          const rangeAyats = ayats.slice(fromIdx, toIdx + 1);
          console.log(
            `📖 Playing ayats ${fromIdx + 1} to ${toIdx + 1} (${
              rangeAyats.length
            } ayats)`,
          );

          if (rangeAyats.length > 0) {
            RootNavigation.navigate('Quran', {
              screen: 'AudioPlayerScreen',
              params: {
                surah_ID: tokenData.surah,
                surahName: ayats[0].NameEnglish,
                data: rangeAyats,
                isRangePlay: true,
                originalAyats: ayats,
                rangeFrom: tokenData.from || 1,
                rangeTo: tokenData.to || ayats.length,
                forceRestart: true,
              },
            });

            setTimeout(() => {
              PlayerService.playSurah(tokenData.surah, rangeAyats, true);
            }, 500);
          }
        }
      }
      return;
    }

    // ============================================================
    // SECTION 5: STANDARD PLAYER CONTROLS (PLAY vs RESUME)
    // ============================================================

    switch (action?.toLowerCase()) {
      // 5.1 - PLAY COMMAND (Always start from beginning)
      case 'play':
        console.log('🎤 Play command - Starting from beginning');

        if (tokenData.type === 'chain') {
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
          }
          return;
        }

        // In handleToken function - PLAY case for bayan

        if (tokenData.type === 'bayan') {
          const bayanList = await getBayanData(tokenData.surahId);

          if (bayanList && bayanList.length > 0) {
            // Get the specific index (default 0)
            const bayanIndex = tokenData.bayanIndex || 0;

            if (bayanIndex < bayanList.length) {
              console.log(
                `🎤 Playing bayan index: ${bayanIndex} of ${bayanList.length}`,
              );

              RootNavigation.navigate('Bayan', {
                screen: 'BayanPlayer',
                params: {
                  bayanList: bayanList,
                  initialIndex: bayanIndex,
                  isVoiceCommand: true,
                },
              });
            } else {
              // Index out of range, play first
              console.log(
                `⚠️ Bayan index ${bayanIndex} out of range, playing first`,
              );
              RootNavigation.navigate('Bayan', {
                screen: 'BayanPlayer',
                params: {
                  bayanList: bayanList,
                  initialIndex: 0,
                  isVoiceCommand: true,
                },
              });
            }
          } else {
            ToastAndroid.show(
              `No bayan found for this surah`,
              ToastAndroid.LONG,
            );
          }
          return;
        }

        if (tokenData.surah) {
          const ayats = await getSurahAyats(tokenData.surah);
          if (ayats?.length > 0) {
            // Clear resume position for this surah
            await AsyncStorage.removeItem(`resume_surah_${tokenData.surah}`);
            await AsyncStorage.removeItem(
              `voice_resume_surah_${tokenData.surah}`,
            );

            RootNavigation.navigate('Quran', {
              screen: 'AudioPlayerScreen',
              params: {
                surah_ID: tokenData.surah,
                surahName: ayats[0].NameEnglish,
                data: ayats,
                isVoiceCommand: true,
                forceRestart: true,
                startFromAyat: 1,
              },
            });

            await PlayerService.playSurah(tokenData.surah, ayats, true);
          }
        }
        break;

      // 5.2 - RESUME COMMAND (Continue from last position)
      case 'resume':
        console.log('🎤 Resume command - Continuing from last position');

        try {
          const currentTrack = await TrackPlayer.getActiveTrackIndex();
          if (currentTrack !== null) {
            await TrackPlayer.play();
            ToastAndroid.show('Resuming...', ToastAndroid.SHORT);
          } else {
            // If nothing is playing, get last played surah
            const lastSurahId = await AsyncStorage.getItem('last_played_surah');
            if (lastSurahId) {
              const ayats = await getSurahAyats(parseInt(lastSurahId));
              if (ayats?.length > 0) {
                RootNavigation.navigate('Quran', {
                  screen: 'AudioPlayerScreen',
                  params: {
                    surah_ID: parseInt(lastSurahId),
                    surahName: ayats[0].NameEnglish,
                    data: ayats,
                    isVoiceCommand: true,
                    isResume: true,
                  },
                });
                await PlayerService.playSurah(
                  parseInt(lastSurahId),
                  ayats,
                  true,
                );
              }
            } else {
              ToastAndroid.show('Nothing to resume', ToastAndroid.SHORT);
            }
          }
        } catch (error) {
          console.error('Resume error:', error);
          ToastAndroid.show('Resume failed', ToastAndroid.SHORT);
        }
        break;

      // 5.3 - PAUSE COMMAND
      case 'pause':
        PlayerService.pause();
        break;

      // 5.4 - NEXT COMMAND
      case 'next':
        if (currentScreen === 'BayanPlayer') {
          PlayerService.nextBayan(true);
        } else {
          PlayerService.next(true);
        }
        break;

      // 5.5 - PREVIOUS COMMAND
      case 'previous':
        if (currentScreen === 'BayanPlayer') {
          PlayerService.previousBayan(true);
        } else {
          PlayerService.previous(true);
        }
        break;

      default:
        console.log('⚠️ Unknown command:', action);
        ToastAndroid.show('Command not recognized', ToastAndroid.SHORT);
    }
  }, []);

  // ============================================================
  // PROCESS COMMAND
  // ============================================================
  const processCommand = useCallback(
    async text => {
      console.log('🔥 VOICE_COMMAND_RECEIVED:', text);
      if (!text) return;

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
        }
      } catch (error) {
        console.log('❌ API Error:', error);
        ToastAndroid.show('Voice command failed', ToastAndroid.SHORT);
      }
    },
    [handleToken],
  );

  return { processCommand };
};
