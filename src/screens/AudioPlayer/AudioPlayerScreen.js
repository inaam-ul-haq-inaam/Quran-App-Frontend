// // // AudioPlayerScreen.js
// // import React from 'react';
// // import {
// //   View,
// //   ActivityIndicator,
// //   Text,
// //   StyleSheet,
// //   StatusBar,
// //   ScrollView, // Lamba text scroll karne k liye
// // } from 'react-native';
// // import { useAudioPlayer } from './useAudioPlayer';
// // import PlayerControls from './PlayerControls';
// // // import AyatList from './AyatList'; // 👈 Iski ab zaroorat nahi

// // export default function AudioPlayerScreen({ route }) {
// //   const {
// //     ayats,
// //     surahName,
// //     loading,
// //     currentIndex,
// //     isPlaying,
// //     play,
// //     pause,
// //     next,
// //     previous,
// //     seek,
// //   } = useAudioPlayer(route.params.surah_ID, route.params.surahName);

// //   // 🎯 JO AYAT CHAL RAHI HAI, USKA DATA NIKAL LIYA
// //   const currentAyat = ayats[currentIndex];

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#1F4037" />
// //         <Text style={styles.loadingText}>Loading Surah...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

// //       {/* Top Player Card */}
// //       <View style={styles.topCard}>
// //         <View style={styles.headerInfo}>
// //           <Text style={styles.surahTitle}>{surahName || 'Surah'}</Text>
// //           <Text style={styles.reciterName}>Mishary Rashid Al-Afasy</Text>
// //         </View>

// //         <View style={styles.divider} />

// //         <View style={styles.controlsWrapper}>
// //           <PlayerControls
// //             isPlaying={isPlaying}
// //             onPlay={play}
// //             onPause={pause}
// //             onNext={next}
// //             onPrevious={previous}
// //           />
// //         </View>
// //       </View>

// //       {/* 🟢 NAYA SECTION: NOW PLAYING AYAT */}
// //       <ScrollView
// //         style={styles.currentAyatContainer}
// //         contentContainerStyle={styles.ayatScrollContent}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {currentAyat ? (
// //           <View style={styles.ayatBox}>
// //             {/* Ayat Number Badge */}
// //             <View style={styles.badgeContainer}>
// //               <Text style={styles.ayatBadge}>Ayat {currentIndex + 1}</Text>
// //             </View>

// //             {/* Arabic Text */}
// //             <Text style={styles.arabicText}>
// //               {currentAyat.ArabicText || currentAyat.text || 'Arabic text here'}
// //             </Text>

// //             {/* Divider */}
// //             <View style={styles.ayatDivider} />

// //             {/* Translation Text */}
// //             <Text style={styles.translationText}>
// //               {currentAyat.UrduTranslation ||
// //                 currentAyat.translation ||
// //                 'Urdu translation here'}
// //             </Text>
// //           </View>
// //         ) : (
// //           <Text style={styles.translationText}>Ayat load ho rahi hai...</Text>
// //         )}
// //       </ScrollView>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F4F6F8',
// //   },

// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#F4F6F8',
// //   },
// //   loadingText: {
// //     marginTop: 15,
// //     fontSize: 16,
// //     color: '#1F4037',
// //     fontWeight: '500',
// //   },

// //   topCard: {
// //     backgroundColor: '#FFFFFF',
// //     paddingTop: 20,
// //     paddingBottom: 30,
// //     borderBottomLeftRadius: 30,
// //     borderBottomRightRadius: 30,
// //     alignItems: 'center',

// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 10,

// //     elevation: 8,
// //     zIndex: 1,
// //   },

// //   headerInfo: {
// //     alignItems: 'center',
// //     marginBottom: 15,
// //   },
// //   surahTitle: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     color: '#1F4037',
// //     fontFamily: 'serif',
// //     letterSpacing: 0.5,
// //   },
// //   reciterName: {
// //     fontSize: 14,
// //     color: '#8E8E93',
// //     marginTop: 5,
// //     fontWeight: '500',
// //   },

// //   divider: {
// //     width: 40,
// //     height: 4,
// //     backgroundColor: '#E0E0E0',
// //     borderRadius: 2,
// //     marginBottom: 20,
// //   },

// //   controlsWrapper: {
// //     width: '100%',
// //     paddingHorizontal: 20,
// //   },

// //   /* 🟢 NAYE STYLES NOW PLAYING KE LIYE */
// //   currentAyatContainer: {
// //     flex: 1,
// //     paddingTop: 20,
// //     paddingHorizontal: 15,
// //   },
// //   ayatScrollContent: {
// //     paddingBottom: 40,
// //   },
// //   ayatBox: {
// //     backgroundColor: '#FFFFFF',
// //     padding: 20,
// //     borderRadius: 20,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 8,
// //     elevation: 3,
// //   },
// //   badgeContainer: {
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   ayatBadge: {
// //     fontSize: 12,
// //     fontWeight: 'bold',
// //     color: '#1F4037',
// //     backgroundColor: '#E8F5E9',
// //     paddingVertical: 5,
// //     paddingHorizontal: 15,
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //   },
// //   arabicText: {
// //     fontSize: 28,
// //     lineHeight: 45,
// //     color: '#333',
// //     textAlign: 'center',
// //     writingDirection: 'rtl',
// //     fontFamily: 'serif', // Agar koi custom arabic font hai to yahan lagayen
// //     marginBottom: 15,
// //   },
// //   ayatDivider: {
// //     height: 1,
// //     backgroundColor: '#F0F0F0',
// //     marginVertical: 15,
// //   },
// //   translationText: {
// //     fontSize: 16,
// //     lineHeight: 28,
// //     color: '#666',
// //     textAlign: 'center',
// //   },
// // });

// import React from 'react';
// import {
//   View,
//   ActivityIndicator,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ScrollView,
// } from 'react-native';
// import { useAudioPlayer } from './useAudioPlayer';
// import PlayerControls from './PlayerControls';

// export default function AudioPlayerScreen({ route }) {
//   // 🚀 Step 1: Parameters ko extract karein (Surah ya Chain dono ke liye)
//   const playType = route.params?.type || 'surah';
//   const playId = route.params?.chainId || route.params?.surah_ID;
//   const playTitle =
//     route.params?.chainTitle || route.params?.surahName || 'Tilawat';

//   // 🚀 Step 2: Hook ko 3 parameters bhejein
//   const {
//     ayats,
//     surahName, // Hook se aane wala dynamic naam
//     loading,
//     currentIndex,
//     isPlaying,
//     play,
//     pause,
//     next,
//     previous,
//   } = useAudioPlayer(playType, playId, playTitle);

//   const currentAyat = ayats[currentIndex];

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#1F4037" />
//         {/* Dynamic Loading Text */}
//         <Text style={styles.loadingText}>
//           Loading {playType === 'chain' ? 'Chain' : 'Surah'}...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       {/* Top Player Card */}
//       <View style={styles.topCard}>
//         <View style={styles.headerInfo}>
//           {/* Hook se aane wala Surah/Chain Name */}
//           <Text style={styles.surahTitle}>{surahName}</Text>
//           <Text style={styles.reciterName}>Mishary Rashid Al-Afasy</Text>
//         </View>

//         <View style={styles.divider} />

//         <View style={styles.controlsWrapper}>
//           <PlayerControls
//             isPlaying={isPlaying}
//             onPlay={play}
//             onPause={pause}
//             onNext={next}
//             onPrevious={previous}
//           />
//         </View>
//       </View>

//       {/* NOW PLAYING AYAT */}
//       <ScrollView
//         style={styles.currentAyatContainer}
//         contentContainerStyle={styles.ayatScrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {currentAyat ? (
//           <View style={styles.ayatBox}>
//             {/* Ayat Number Badge */}
//             <View style={styles.badgeContainer}>
//               <Text style={styles.ayatBadge}>
//                 {/* 🎯 Agar Chain hai toh Ayat ke sath Surah ka naam bhi dikhayein */}
//                 {playType === 'chain' && currentAyat.surahName
//                   ? `${currentAyat.surahName} - Ayat ${currentAyat.ayatNumber}`
//                   : `Ayat ${currentAyat.AyatNumber || currentIndex + 1}`}
//               </Text>
//             </View>

//             {/* Arabic Text */}
//             <Text style={styles.arabicText}>
//               {currentAyat.ArabicText || currentAyat.text || 'Arabic text here'}
//             </Text>

//             <View style={styles.ayatDivider} />

//             {/* Translation Text */}
//             <Text style={styles.translationText}>
//               {currentAyat.urduText ||
//                 currentAyat.UrduTranslation ||
//                 'Urdu translation here'}
//             </Text>
//           </View>
//         ) : (
//           <Text style={styles.translationText}>Ayat load ho rahi hai...</Text>
//         )}
//       </ScrollView>
//     </View>
//   );
// }

// // ... Styles wahi rahenge jo aapne pehle likhe thay ...
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F6F8' },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F4F6F8',
//   },
//   loadingText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: '#1F4037',
//     fontWeight: '500',
//   },
//   topCard: {
//     backgroundColor: '#FFFFFF',
//     paddingTop: 20,
//     paddingBottom: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 8,
//     zIndex: 1,
//   },
//   headerInfo: { alignItems: 'center', marginBottom: 15 },
//   surahTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1F4037',
//     fontFamily: 'serif',
//     letterSpacing: 0.5,
//   },
//   reciterName: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginTop: 5,
//     fontWeight: '500',
//   },
//   divider: {
//     width: 40,
//     height: 4,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 2,
//     marginBottom: 20,
//   },
//   controlsWrapper: { width: '100%', paddingHorizontal: 20 },
//   currentAyatContainer: { flex: 1, paddingTop: 20, paddingHorizontal: 15 },
//   ayatScrollContent: { paddingBottom: 40 },
//   ayatBox: {
//     backgroundColor: '#FFFFFF',
//     padding: 20,
//     borderRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   badgeContainer: { alignItems: 'center', marginBottom: 20 },
//   ayatBadge: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#1F4037',
//     backgroundColor: '#E8F5E9',
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   arabicText: {
//     fontSize: 28,
//     lineHeight: 45,
//     color: '#333',
//     textAlign: 'center',
//     writingDirection: 'rtl',
//     fontFamily: 'serif',
//     marginBottom: 15,
//   },
//   ayatDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
//   translationText: {
//     fontSize: 16,
//     lineHeight: 28,
//     color: '#666',
//     textAlign: 'center',
//   },
// });

//AudioPlayerScreen.js
import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useAudioPlayer } from '../AudioPlayer/useAudioPlayer'; // 👈 Hook ka sahi path check karlein
import PlayerControls from '../AudioPlayer/PlayerControls'; // 👈 Components ka path

export default function AudioPlayerScreen({ route }) {
  // 🚀 Step 1: Params extraction (Flexible for Surah or Chain)
  const playType = route.params?.type || 'surah';
  const playId =
    route.params?.chainId || route.params?.surah_ID || route.params?.id;
  const playTitle =
    route.params?.chainTitle || route.params?.surahName || 'Tilawat';

  // 🚀 Step 2: Hook integration
  // Hum wahi names use kar rahe hain jo useAudioPlayer return karta hai
  const {
    ayats,
    surahName, // Dynamic name from API/Params
    loading,
    currentIndex,
    isPlaying,
    play,
    pause,
    next,
    previous,
    seekToTime, // Slider control ke liye
  } = useAudioPlayer(playType, playId, playTitle);

  // 🎯 Current playing ayat ka data
  const currentAyat = ayats[currentIndex];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F4037" />
        <Text style={styles.loadingText}>
          Loading {playType === 'chain' ? 'Chain' : 'Surah'}...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- Header & Player Controls --- */}
      <View style={styles.topCard}>
        <View style={styles.headerInfo}>
          <Text style={styles.surahTitle}>{surahName}</Text>
          <Text style={styles.reciterName}>Mishary Rashid Al-Afasy</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.controlsWrapper}>
          <PlayerControls
            isPlaying={isPlaying}
            onPlay={play}
            onPause={pause}
            onNext={next}
            onPrevious={previous}
            onSeek={seekToTime}
          />
        </View>
      </View>

      {/* --- Now Playing Display (Ayat & Translation) --- */}
      <ScrollView
        style={styles.currentAyatContainer}
        contentContainerStyle={styles.ayatScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentAyat ? (
          <View style={styles.ayatBox}>
            <View style={styles.badgeContainer}>
              <Text style={styles.ayatBadge}>
                {/* Chain mode mein Surah ka naam bhi dikhayen */}
                {playType === 'chain' && currentAyat.surahName
                  ? `${currentAyat.surahName} - Ayat ${
                      currentAyat.ayatNumber ?? currentIndex + 1
                    }`
                  : `Ayat ${
                      currentAyat.AyatNumber ||
                      currentAyat.ayatNumber ||
                      currentIndex + 1
                    }`}
              </Text>
            </View>

            {/* Arabic Text */}
            <Text style={styles.arabicText}>
              {currentAyat.ArabicText || currentAyat.text || '...'}
            </Text>

            <View style={styles.ayatDivider} />

            {/* Translation Text */}
            <Text style={styles.translationText}>
              {currentAyat.urduText ||
                currentAyat.UrduTranslation ||
                currentAyat.translation ||
                'Translation not available'}
            </Text>
          </View>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.translationText}>Ayat Load Nahi Ho Saki</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#1F4037',
    fontWeight: '600',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    zIndex: 10,
  },
  headerInfo: { alignItems: 'center', marginBottom: 15 },
  surahTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F4037',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  reciterName: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 5,
    fontWeight: '500',
  },
  divider: {
    width: 50,
    height: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 2,
    marginBottom: 20,
  },
  controlsWrapper: { width: '100%', paddingHorizontal: 10 },
  currentAyatContainer: { flex: 1, paddingHorizontal: 15 },
  ayatScrollContent: { paddingTop: 25, paddingBottom: 50 },
  ayatBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  badgeContainer: { alignItems: 'center', marginBottom: 25 },
  ayatBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F4037',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  arabicText: {
    fontSize: 30,
    lineHeight: 52,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'serif',
    marginBottom: 10,
  },
  ayatDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  translationText: {
    fontSize: 17,
    lineHeight: 30,
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorBox: { padding: 20, alignItems: 'center' },
});
