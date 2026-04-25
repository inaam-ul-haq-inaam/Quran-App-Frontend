// // // // VoiceCommandController.js

// // // import PlayerService from '../Service/PlayerService';
// // // import { ToastAndroid } from 'react-native';
// // // import { BASE_URL } from '../Config/config';
// // // import { getSurahAyats, getBayanData, getChainDetails } from './Api';
// // // import * as RootNavigation from '../navigation/RootNavigation';
// // // import { handlePlayChain } from '../screens/ChainScreen/showChain/useChainController';

// // // class VoiceCommandController {
// // //   // 📡 Receive voice/text command
// // //   async processCommand(text) {
// // //     if (!text) return;

// // //     const cleanText = text.toLowerCase().trim();
// // //     console.log('🎤 Sending to API:', cleanText);

// // //     try {
// // //       const response = await fetch(`${BASE_URL}/voice/command`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ text: cleanText }),
// // //       });

// // //       const data = await response.json();
// // //       console.log('🤖 FULL API Response:', JSON.stringify(data));

// // //       if (!data || !data.token) {
// // //         ToastAndroid.show(
// // //           '❌ Invalid response from server',
// // //           ToastAndroid.SHORT,
// // //         );
// // //         return;
// // //       }

// // //       const action = data.token.player;
// // //       const surahId = data.token.surah;
// // //       const fromAyat = data.token.from;
// // //       const toAyat = data.token.to;
// // //       const ayatNumber = data.token.ayatNumber;
// // //       const type = data.token.type;

// // //       if (!action) {
// // //         ToastAndroid.show('Command Unknown', ToastAndroid.SHORT);
// // //         return;
// // //       }

// // //       await this.handleToken(action, {
// // //         type,
// // //         surahId,
// // //         fromAyat,
// // //         toAyat,
// // //         ayatNumber,
// // //       });
// // //     } catch (error) {
// // //       console.log('❌ Voice API Error:', error);
// // //       ToastAndroid.show('Server Error', ToastAndroid.SHORT);
// // //     }
// // //   }

// // //   // 🔹 Execute action safely
// // //   async handleToken(action, tokenData) {
// // //     const currentScreen = RootNavigation.getCurrentRouteName();
// // //     console.log('🎯 Inside handleToken:', action, tokenData);

// // //     switch (action.toLowerCase()) {
// // //       case 'play':
// // //         if (!tokenData?.surahId) {
// // //           if (
// // //             currentScreen !== 'AudioPlayerScreen' &&
// // //             currentScreen !== 'BayanPlayer'
// // //           ) {
// // //             ToastAndroid.show(
// // //               'Invalid command for this screen',
// // //               ToastAndroid.SHORT,
// // //             );
// // //             break;
// // //           }
// // //           console.log('⚠ No Surah ID provided. Resuming...');
// // //           PlayerService.play();
// // //           ToastAndroid.show('▶ Resuming...', ToastAndroid.SHORT);
// // //           return;
// // //         }

// // //         // 🟢 BAYAN KI LOGIC
// // //         if (tokenData.type === 'bayan') {
// // //           console.log('📥 Fetching Bayan for Surah:', tokenData.surahId);

// // //           let bayanResponse = await getBayanData(tokenData.surahId);

// // //           let bayanList = bayanResponse;
// // //           if (bayanResponse && bayanResponse.Bayans) {
// // //             bayanList = bayanResponse.Bayans;
// // //           }

// // //           if (
// // //             !bayanList ||
// // //             !Array.isArray(bayanList) ||
// // //             bayanList.length === 0
// // //           ) {
// // //             console.log('❌ No bayan returned from API');
// // //             ToastAndroid.show(
// // //               'Is Surah ka Bayan nahi mila',
// // //               ToastAndroid.SHORT,
// // //             );
// // //             return;
// // //           }

// // //           console.log('📦 Bayan Array Length:', bayanList.length);

// // //           // 🧠 SMART INDEXING: Faisla karein ke kis number se chalana hai
// // //           let startIndex = 0;

// // //           // Case 1: Agar user ne specific ayat boli hai (e.g., "Baqarah bayan ayat 50")
// // //           if (tokenData.fromAyat) {
// // //             const foundIndex = bayanList.findIndex(
// // //               b =>
// // //                 b.StartAyatID <= tokenData.fromAyat &&
// // //                 b.EndAyatID >= tokenData.fromAyat,
// // //             );
// // //             if (foundIndex !== -1) {
// // //               startIndex = foundIndex;
// // //               console.log(`🎯 Exact Ayat Range Found at index:`, startIndex);
// // //             } else {
// // //               ToastAndroid.show(
// // //                 `Ayat ${tokenData.fromAyat} ka bayan nahi mila, shuru se chala rahe hain`,
// // //                 ToastAndroid.SHORT,
// // //               );
// // //             }
// // //           }
// // //           // Case 2: Agar specific ayat nahi boli, toh Introductions (Null Ayats) ko skip karo
// // //           else {
// // //             const firstSurahIndex = bayanList.findIndex(
// // //               b => b.StartAyatID !== null,
// // //             );
// // //             if (firstSurahIndex !== -1) {
// // //               startIndex = firstSurahIndex;
// // //               console.log(
// // //                 `⏭ Skipped Introductions, starting at real Surah index:`,
// // //                 startIndex,
// // //               );
// // //             }
// // //           }

// // //           if (PlayerService.setBayanID) {
// // //             PlayerService.setBayanID(tokenData.surahId);
// // //           }

// // //           // ✅ Navigate to Bayan Player with Smart Index
// // //           RootNavigation.navigate('Bayan', {
// // //             screen: 'BayanPlayer',
// // //             params: {
// // //               bayanList: bayanList,
// // //               initialIndex: startIndex, // 👈 Ab yahan 0 k bajaye hamara calculated index jayega!
// // //             },
// // //           });

// // //           ToastAndroid.show(`▶ Playing Bayan`, ToastAndroid.SHORT);
// // //         }
// // //         // 🔵 SURAH KI LOGIC
// // //         else {
// // //           console.log('📥 Fetching FULL Surah:', tokenData.surahId);

// // //           // 🛠️ FIX 1: Humne fromAyat aur toAyat hata diye (hamesha poori Surah mangwayen)
// // //           const ayats = await getSurahAyats(
// // //             tokenData.surahId,
// // //             null, // fromAyat ko null kiya
// // //             null, // toAyat ko null kiya
// // //           );

// // //           if (!ayats || ayats.length === 0) {
// // //             console.log('❌ No ayats returned from API');
// // //             ToastAndroid.show('Ayats not found', ToastAndroid.SHORT);
// // //             return;
// // //           }

// // //           console.log('📦 Full Ayats received in Controller:', ayats.length);

// // //           // Player ko Surah ki ID batayen
// // //           if (PlayerService.setSurahID) {
// // //             PlayerService.setSurahID(tokenData.surahId);
// // //           }

// // //           // ✅ Pass ONLY ayats
// // //           RootNavigation.navigate('Quran', {
// // //             screen: 'AudioPlayerScreen',
// // //             params: {
// // //               surah_ID: tokenData.surahId,
// // //               surahName: ayats[0]?.NameEnglish,
// // //               data: ayats,
// // //             },
// // //           });

// // //           // Poori Surah Player mein load aur play karein
// // //           await PlayerService.playSurah(tokenData.surahId, ayats);

// // //           // 🛠️ FIX 2: Agar user ne koi specific Ayat boli hai, toh us par JUMP karein!
// // //           if (tokenData.fromAyat) {
// // //             console.log(`🚀 Jumping directly to Ayat ${tokenData.fromAyat}...`);

// // //             // Thora sa delay dena zaroori hai taake track player load ho jaye
// // //             setTimeout(() => {
// // //               PlayerService.jumpToAyat(tokenData.fromAyat);
// // //               ToastAndroid.show(
// // //                 `⏭ Playing from Ayat ${tokenData.fromAyat}`,
// // //                 ToastAndroid.SHORT,
// // //               );
// // //             }, 1000);
// // //           } else {
// // //             ToastAndroid.show(
// // //               `▶ Playing Surah ${ayats[0].NameEnglish}`,
// // //               ToastAndroid.SHORT,
// // //             );
// // //           }
// // //         }
// // //         break;

// // //       case 'pause':
// // //         PlayerService.pause();
// // //         ToastAndroid.show('⏸ Paused', ToastAndroid.SHORT);
// // //         break;

// // //       case 'next':
// // //         console.log('📱 Current Screen is:', currentScreen);

// // //         // 🛠️ Agar Navigation tab ya stack ka naam mil jaye to safety k liye dono add kiye hain
// // //         if (currentScreen === 'BayanPlayer' || currentScreen === 'Bayan') {
// // //           PlayerService.nextBayan();
// // //           ToastAndroid.show('⏭ Next Bayan', ToastAndroid.SHORT);
// // //         } else {
// // //           PlayerService.next();
// // //           ToastAndroid.show('⏭ Next Surah', ToastAndroid.SHORT);
// // //         }
// // //         break;

// // //       case 'previous':
// // //         console.log('📱 Current Screen is:', currentScreen);

// // //         // 🛠️ Yahan Bayan ki logic missing thi jo ab add kardi hai
// // //         if (currentScreen === 'BayanPlayer' || currentScreen === 'Bayan') {
// // //           PlayerService.previousBayan();
// // //           ToastAndroid.show('⏮ Previous Bayan', ToastAndroid.SHORT);
// // //         } else {
// // //           PlayerService.previous();
// // //           ToastAndroid.show('⏮ Previous Surah', ToastAndroid.SHORT);
// // //         }
// // //         break;

// // //       case 'jump':
// // //         if (tokenData.ayatNumber) {
// // //           PlayerService.jumpToAyat(tokenData.ayatNumber);
// // //           ToastAndroid.show(
// // //             `⏭ Jumping to Ayat ${tokenData.ayatNumber}`,
// // //             ToastAndroid.SHORT,
// // //           );
// // //         } else {
// // //           ToastAndroid.show('Ayat number samajh nahi aaya', ToastAndroid.SHORT);
// // //         }
// // //         break;

// // //       default:
// // //         console.log('⚠ Unknown Action:', action);
// // //         ToastAndroid.show('Unknown Command', ToastAndroid.SHORT);
// // //     }
// // //   }
// // // }

// // // export default new VoiceCommandController();

// // // VoiceCommandController.js

// // import PlayerService from '../Service/PlayerService';
// // import { ToastAndroid } from 'react-native';
// // import { BASE_URL } from '../Config/config';
// // import { getSurahAyats, getBayanData, getChainDetails } from './Api';
// // import * as RootNavigation from '../navigation/RootNavigation';
// // import { handlePlayChain } from '../screens/ChainScreen/showChain/useChainController';

// // class VoiceCommandController {
// //   // 📡 Receive voice/text command
// //   async processCommand(text) {
// //     if (!text) return;

// //     const cleanText = text.toLowerCase().trim();
// //     console.log('🎤 Sending to API:', cleanText);

// //     try {
// //       const response = await fetch(`${BASE_URL}/voice/command`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ text: cleanText }),
// //       });

// //       const data = await response.json();
// //       console.log('🤖 FULL API Response:', JSON.stringify(data));

// //       if (!data || !data.token) {
// //         ToastAndroid.show(
// //           '❌ Invalid response from server',
// //           ToastAndroid.SHORT,
// //         );
// //         return;
// //       }

// //       // Extracting tokens from backend response
// //       const action = data.token.player;
// //       const surahId = data.token.surah;
// //       const fromAyat = data.token.from;
// //       const toAyat = data.token.to;
// //       const ayatNumber = data.token.ayatNumber;
// //       const type = data.token.type;
// //       const chainName = data.token.chain_name; // 👈 NAYA: Backend se chain ka naam liya

// //       if (!action) {
// //         ToastAndroid.show('Command Unknown', ToastAndroid.SHORT);
// //         return;
// //       }

// //       await this.handleToken(action, {
// //         type,
// //         surahId,
// //         fromAyat,
// //         toAyat,
// //         ayatNumber,
// //         chainName, // 👈 Token data mein pass kiya
// //       });
// //     } catch (error) {
// //       console.log('❌ Voice API Error:', error);
// //       ToastAndroid.show('Server Error', ToastAndroid.SHORT);
// //     }
// //   }

// //   // 🔹 Execute action safely
// //   async handleToken(action, tokenData) {
// //     const currentScreen = RootNavigation.getCurrentRouteName();
// //     console.log('🎯 Inside handleToken:', action, tokenData);

// //     switch (action.toLowerCase()) {
// //       case 'play':
// //         // 🔗 1. CHAIN PLAY LOGIC (Sabse pehle check karein)
// //         // VoiceCommandController.js ke andar "case 'play':" ka Chain wala hissa

// //         if (tokenData.type === 'chain') {
// //           console.log('🔗 Voice Chain Logic Triggered:', tokenData.chainName);

// //           const chainDetails = await getChainDetails(tokenData.chainName);

// //           if (chainDetails && chainDetails.length > 0) {
// //             console.log('✅ Chain data fetched, items:', chainDetails.length);

// //             // 1. Navigation: Hum directly AudioPlayerScreen par jayenge
// //             // Note: 'Quran' aapka stack name hai aur 'AudioPlayerScreen' screen name
// //             RootNavigation.navigate('Quran', {
// //               screen: 'AudioPlayerScreen',
// //               params: {
// //                 type: 'chain',
// //                 surah_ID: chainDetails[0].surahId, // Pehli surah ki ID
// //                 surahName: 'Chain: ' + tokenData.chainName,
// //                 data: chainDetails, // Poori playlist (8 items) bhej di
// //               },
// //             });

// //             // 2. Audio Playback: PlayerService ko playlist pakra dein
// //             // Hum wait karenge taake player load ho jaye
// //             setTimeout(async () => {
// //               try {
// //                 await PlayerService.playSurah(
// //                   chainDetails[0].surahId,
// //                   chainDetails,
// //                 );
// //                 console.log('🎵 Audio started playing for chain');
// //               } catch (playError) {
// //                 console.log('❌ PlayerService Error:', playError);
// //               }
// //             }, 500);

// //             ToastAndroid.show(
// //               `▶ Playing Chain: ${tokenData.chainName}`,
// //               ToastAndroid.SHORT,
// //             );
// //           } else {
// //             ToastAndroid.show(
// //               'Is naam ki chain nahi mili ya khali hai',
// //               ToastAndroid.SHORT,
// //             );
// //           }
// //           return; // Chain process ho gayi
// //         }

// //         // 2. RESUME LOGIC (Agar Surah ID na ho)
// //         if (!tokenData?.surahId) {
// //           if (
// //             currentScreen !== 'AudioPlayerScreen' &&
// //             currentScreen !== 'BayanPlayer'
// //           ) {
// //             ToastAndroid.show(
// //               'Invalid command for this screen',
// //               ToastAndroid.SHORT,
// //             );
// //             break;
// //           }
// //           console.log('⚠ No Surah ID provided. Resuming...');
// //           PlayerService.play();
// //           ToastAndroid.show('▶ Resuming...', ToastAndroid.SHORT);
// //           return;
// //         }

// //         // 🟢 3. BAYAN KI LOGIC
// //         if (tokenData.type === 'bayan') {
// //           console.log('📥 Fetching Bayan for Surah:', tokenData.surahId);

// //           let bayanResponse = await getBayanData(tokenData.surahId);
// //           let bayanList =
// //             bayanResponse && bayanResponse.Bayans
// //               ? bayanResponse.Bayans
// //               : bayanResponse;

// //           if (
// //             !bayanList ||
// //             !Array.isArray(bayanList) ||
// //             bayanList.length === 0
// //           ) {
// //             ToastAndroid.show(
// //               'Is Surah ka Bayan nahi mila',
// //               ToastAndroid.SHORT,
// //             );
// //             return;
// //           }

// //           let startIndex = 0;
// //           if (tokenData.fromAyat) {
// //             const foundIndex = bayanList.findIndex(
// //               b =>
// //                 b.StartAyatID <= tokenData.fromAyat &&
// //                 b.EndAyatID >= tokenData.fromAyat,
// //             );
// //             if (foundIndex !== -1) startIndex = foundIndex;
// //           } else {
// //             const firstSurahIndex = bayanList.findIndex(
// //               b => b.StartAyatID !== null,
// //             );
// //             if (firstSurahIndex !== -1) startIndex = firstSurahIndex;
// //           }

// //           if (PlayerService.setBayanID)
// //             PlayerService.setBayanID(tokenData.surahId);

// //           RootNavigation.navigate('Bayan', {
// //             screen: 'BayanPlayer',
// //             params: { bayanList: bayanList, initialIndex: startIndex },
// //           });

// //           ToastAndroid.show(`▶ Playing Bayan`, ToastAndroid.SHORT);
// //         }

// //         // 🔵 4. SURAH KI LOGIC
// //         else {
// //           console.log('📥 Fetching FULL Surah:', tokenData.surahId);
// //           const ayats = await getSurahAyats(tokenData.surahId, null, null);

// //           if (!ayats || ayats.length === 0) {
// //             ToastAndroid.show('Ayats not found', ToastAndroid.SHORT);
// //             return;
// //           }

// //           if (PlayerService.setSurahID)
// //             PlayerService.setSurahID(tokenData.surahId);

// //           RootNavigation.navigate('Quran', {
// //             screen: 'AudioPlayerScreen',
// //             params: {
// //               surah_ID: tokenData.surahId,
// //               surahName: ayats[0]?.NameEnglish,
// //               data: ayats,
// //             },
// //           });

// //           await PlayerService.playSurah(tokenData.surahId, ayats);

// //           if (tokenData.fromAyat) {
// //             setTimeout(() => {
// //               PlayerService.jumpToAyat(tokenData.fromAyat);
// //               ToastAndroid.show(
// //                 `⏭ Playing from Ayat ${tokenData.fromAyat}`,
// //                 ToastAndroid.SHORT,
// //               );
// //             }, 1000);
// //           } else {
// //             ToastAndroid.show(
// //               `▶ Playing Surah ${ayats[0].NameEnglish}`,
// //               ToastAndroid.SHORT,
// //             );
// //           }
// //         }
// //         break;

// //       case 'pause':
// //         PlayerService.pause();
// //         ToastAndroid.show('⏸ Paused', ToastAndroid.SHORT);
// //         break;

// //       case 'next':
// //         if (currentScreen === 'BayanPlayer' || currentScreen === 'Bayan') {
// //           PlayerService.nextBayan();
// //           ToastAndroid.show('⏭ Next Bayan', ToastAndroid.SHORT);
// //         } else {
// //           PlayerService.next();
// //           ToastAndroid.show('⏭ Next Surah', ToastAndroid.SHORT);
// //         }
// //         break;

// //       case 'previous':
// //         if (currentScreen === 'BayanPlayer' || currentScreen === 'Bayan') {
// //           PlayerService.previousBayan();
// //           ToastAndroid.show('⏮ Previous Bayan', ToastAndroid.SHORT);
// //         } else {
// //           PlayerService.previous();
// //           ToastAndroid.show('⏮ Previous Surah', ToastAndroid.SHORT);
// //         }
// //         break;

// //       case 'jump':
// //         if (tokenData.ayatNumber) {
// //           PlayerService.jumpToAyat(tokenData.ayatNumber);
// //           ToastAndroid.show(
// //             `⏭ Jumping to Ayat ${tokenData.ayatNumber}`,
// //             ToastAndroid.SHORT,
// //           );
// //         } else {
// //           ToastAndroid.show('Ayat number samajh nahi aaya', ToastAndroid.SHORT);
// //         }
// //         break;

// //       default:
// //         console.log('⚠ Unknown Action:', action);
// //         ToastAndroid.show('Unknown Command', ToastAndroid.SHORT);
// //     }
// //   }
// // }

// // export default new VoiceCommandController();

// import { useCallback } from 'react';
// import { ToastAndroid } from 'react-native';
// import { useNavigation, useNavigationState } from '@react-navigation/native';
// import { BASE_URL } from '../Config/config';
// import { getSurahAyats, getBayanData, getChainDetails } from './Api';
// import PlayerService from '../Service/PlayerService';

// export const useVoiceCommand = () => {
//   const navigation = useNavigation();

//   // Current screen name hasil karne ke liye hook
//   const currentScreen = useNavigationState(state => {
//     const route = state?.routes[state.index];
//     return route?.name;
//   });

//   // 🔹 Execute action safely (Token handling logic)
//   const handleToken = useCallback(
//     async (action, tokenData) => {
//       console.log('🎯 Inside handleToken:', action, tokenData);

//       switch (action.toLowerCase()) {
//         case 'play':
//           // 🔗 1. CHAIN PLAY LOGIC
//           if (tokenData.type === 'chain') {
//             console.log('🔗 Voice Chain Logic Triggered:', tokenData.chainName);
//             const chainDetails = await getChainDetails(tokenData.chainName);

//             if (chainDetails && chainDetails.length > 0) {
//               navigation.navigate('Quran', {
//                 screen: 'AudioPlayerScreen',
//                 params: {
//                   type: 'chain',
//                   surah_ID: chainDetails[0].surahId,
//                   surahName: 'Chain: ' + tokenData.chainName,
//                   data: chainDetails,
//                 },
//               });

//               setTimeout(async () => {
//                 try {
//                   await PlayerService.playSurah(
//                     chainDetails[0].surahId,
//                     chainDetails,
//                   );
//                 } catch (e) {
//                   console.log('❌ Player Error:', e);
//                 }
//               }, 500);

//               ToastAndroid.show(
//                 `▶ Playing Chain: ${tokenData.chainName}`,
//                 ToastAndroid.SHORT,
//               );
//             } else {
//               ToastAndroid.show(
//                 'Chain nahi mili ya khali hai',
//                 ToastAndroid.SHORT,
//               );
//             }
//             return;
//           }

//           // 2. RESUME LOGIC
//           if (!tokenData?.surahId) {
//             if (
//               currentScreen !== 'AudioPlayerScreen' &&
//               currentScreen !== 'BayanPlayer'
//             ) {
//               ToastAndroid.show(
//                 'Invalid command for this screen',
//                 ToastAndroid.SHORT,
//               );
//               break;
//             }
//             PlayerService.play();
//             ToastAndroid.show('▶ Resuming...', ToastAndroid.SHORT);
//             return;
//           }

//           // 🟢 3. BAYAN KI LOGIC
//           if (tokenData.type === 'bayan') {
//             let bayanResponse = await getBayanData(tokenData.surahId);
//             let bayanList = bayanResponse?.Bayans || bayanResponse;

//             if (
//               !bayanList ||
//               !Array.isArray(bayanList) ||
//               bayanList.length === 0
//             ) {
//               ToastAndroid.show(
//                 'Is Surah ka Bayan nahi mila',
//                 ToastAndroid.SHORT,
//               );
//               return;
//             }

//             let startIndex = 0;
//             if (tokenData.fromAyat) {
//               const foundIndex = bayanList.findIndex(
//                 b =>
//                   b.StartAyatID <= tokenData.fromAyat &&
//                   b.EndAyatID >= tokenData.fromAyat,
//               );
//               if (foundIndex !== -1) startIndex = foundIndex;
//             } else {
//               const firstIndex = bayanList.findIndex(
//                 b => b.StartAyatID !== null,
//               );
//               if (firstIndex !== -1) startIndex = firstIndex;
//             }

//             PlayerService.setBayanID?.(tokenData.surahId);
//             navigation.navigate('Bayan', {
//               screen: 'BayanPlayer',
//               params: { bayanList, initialIndex: startIndex },
//             });
//             ToastAndroid.show(`▶ Playing Bayan`, ToastAndroid.SHORT);
//           }

//           // 🔵 4. SURAH KI LOGIC
//           else {
//             const ayats = await getSurahAyats(tokenData.surahId, null, null);
//             if (!ayats || ayats.length === 0) {
//               ToastAndroid.show('Ayats not found', ToastAndroid.SHORT);
//               return;
//             }

//             PlayerService.setSurahID?.(tokenData.surahId);
//             navigation.navigate('Quran', {
//               screen: 'AudioPlayerScreen',
//               params: {
//                 surah_ID: tokenData.surahId,
//                 surahName: ayats[0]?.NameEnglish,
//                 data: ayats,
//               },
//             });

//             await PlayerService.playSurah(tokenData.surahId, ayats);

//             if (tokenData.fromAyat) {
//               setTimeout(() => {
//                 PlayerService.jumpToAyat(tokenData.fromAyat);
//                 ToastAndroid.show(
//                   `⏭ Playing from Ayat ${tokenData.fromAyat}`,
//                   ToastAndroid.SHORT,
//                 );
//               }, 1000);
//             } else {
//               ToastAndroid.show(
//                 `▶ Playing Surah ${ayats[0].NameEnglish}`,
//                 ToastAndroid.SHORT,
//               );
//             }
//           }
//           break;

//         case 'pause':
//           PlayerService.pause();
//           ToastAndroid.show('Pause', ToastAndroid.SHORT);
//           break;

//         case 'next':
//           if (currentScreen === 'BayanPlayer') PlayerService.nextBayan();
//           else PlayerService.next();
//           break;

//         case 'previous':
//           if (currentScreen === 'BayanPlayer') PlayerService.previousBayan();
//           else PlayerService.previous();
//           break;

//         case 'jump':
//           if (tokenData.ayatNumber) {
//             PlayerService.jumpToAyat(tokenData.ayatNumber);
//           } else {
//             ToastAndroid.show('Ayat number nahi mila', ToastAndroid.SHORT);
//           }
//           break;

//         default:
//           console.log('⚠ Unknown Action:', action);
//       }
//     },
//     [navigation, currentScreen],
//   );

//   // 📡 Main Process Command Function
//   const processCommand = useCallback(
//     async text => {
//       if (!text) return;
//       const cleanText = text.toLowerCase().trim();

//       try {
//         const response = await fetch(`${BASE_URL}/voice/command`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ text: cleanText }),
//         });

//         const data = await response.json();
//         if (!data?.token) {
//           ToastAndroid.show('Command samajh nahi aayi', ToastAndroid.SHORT);
//           return;
//         }

//         const { player, surah, from, to, ayatNumber, type, chain_name } =
//           data.token;

//         await handleToken(player, {
//           type,
//           surahId: surah,
//           fromAyat: from,
//           toAyat: to,
//           ayatNumber,
//           chainName: chain_name,
//         });
//       } catch (error) {
//         console.log('❌ Voice API Error:', error);
//         ToastAndroid.show('Server Error', ToastAndroid.SHORT);
//       }
//     },
//     [handleToken],
//   );

//   return { processCommand };
// };
import { useCallback } from 'react';
import { ToastAndroid } from 'react-native';
import * as RootNavigation from '../navigation/RootNavigation'; // 👈 Apna sahi path check karein
import { BASE_URL } from '../Config/config';
import { getSurahAyats, getBayanData, getChainDetails } from './Api';
import PlayerService from './PlayerService';

export const useVoiceCommand = () => {
  // --- 🎯 Token Handling Logic ---
  const handleToken = useCallback(async (action, tokenData) => {
    console.log('🎯 Action Received:', action, 'Data:', tokenData);

    // 🔍 Current Screen pata karne ka tareeqa via Ref
    const currentRoute = RootNavigation.navigationRef.getCurrentRoute();
    const currentScreen = currentRoute?.name;

    switch (action?.toLowerCase()) {
      case 'play':
        // 🔗 1. Chain Play
        if (tokenData.type === 'chain') {
          const chainDetails = await getChainDetails(tokenData.chainName);
          if (chainDetails?.length > 0) {
            RootNavigation.navigate('Quran', {
              screen: 'AudioPlayerScreen',
              params: {
                type: 'chain',
                id: tokenData.chainName,
                title: 'Chain: ' + tokenData.chainName,
                data: chainDetails,
              },
            });
            setTimeout(
              () =>
                PlayerService.playSurah(chainDetails[0].surahId, chainDetails),
              500,
            );
          }
          return;
        }

        // 🟢 2. Bayan Logic
        if (tokenData.type === 'bayan') {
          const bayanList = await getBayanData(tokenData.surahId);
          if (bayanList?.length > 0) {
            RootNavigation.navigate('Bayan', {
              screen: 'BayanPlayer',
              params: { bayanList, initialIndex: 0 },
            });
          }
          return;
        }

        // 🔵 3. Surah Logic
        if (tokenData.surah) {
          const ayats = await getSurahAyats(tokenData.surah);
          if (ayats?.length > 0) {
            RootNavigation.navigate('Quran', {
              screen: 'AudioPlayerScreen',
              params: {
                surah_ID: tokenData.surah,
                surahName: ayats[0].NameEnglish,
                data: ayats,
              },
            });
            await PlayerService.playSurah(tokenData.surah, ayats);
          }
        }
        break;

      case 'pause':
        PlayerService.pause();
        break;

      case 'resume':
        PlayerService.play();
        break;

      case 'next':
        currentScreen === 'BayanPlayer'
          ? PlayerService.nextBayan()
          : PlayerService.next();
        break;

      case 'previous':
        currentScreen === 'BayanPlayer'
          ? PlayerService.previousBayan()
          : PlayerService.previous();
        break;

      default:
        console.log('⚠️ Unknown command');
    }
  }, []); // Dependencies se navigation nikal di kyunke ref use ho raha hai

  const processCommand = useCallback(
    async text => {
      console.log('🔥 HOOK_INTERNAL_RECEIVED:', text);
      if (!text) return;

      try {
        const response = await fetch(`${BASE_URL}/voice/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.toLowerCase().trim() }),
        });

        const data = await response.json();
        console.log('🤖 Backend ka Jawab:', data);

        if (data?.token) {
          handleToken(data.token.player, data.token);
        }
      } catch (error) {
        console.log('❌ API Error:', error);
      }
    },
    [handleToken],
  );

  return { processCommand };
};
