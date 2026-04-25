// // AyatList.js
// import React from 'react';
// import { FlatList, TouchableOpacity, Text } from 'react-native';

// export default function AyatList({ ayats, currentIndex, onSelect }) {
//   return (
//     <FlatList
//       data={ayats}
//       keyExtractor={(_, i) => i.toString()}
//       renderItem={({ item, index }) => {
//         const active = index === currentIndex;
//         const num = item.AyatNumber ?? 0;

//         return (
//           <TouchableOpacity
//             onPress={() => onSelect(index)}
//             style={{
//               padding: 15,
//               backgroundColor: active ? '#E8F5E9' : '#fff',
//             }}
//           >
//             <Text>{num === 0 ? 'Bismillah' : num}</Text>
//             <Text>{item.ArabicText}</Text>
//           </TouchableOpacity>
//         );
//       }}
//     />
//   );
// }

import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

const AyatList = ({ ayats, currentIndex, onSelect }) => {
  const listRef = useRef(null);

  // 🚀 AUTO-SCROLL LOGIC: Jab bhi currentIndex badle, list wahan scroll ho jaye
  useEffect(() => {
    if (ayats.length > 0 && currentIndex >= 0) {
      listRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true,
        viewPosition: 0.5, // Screen ke center mein rakhega active ayat ko
      });
    }
  }, [currentIndex, ayats]);

  const renderItem = ({ item, index }) => {
    const active = index === currentIndex;
    const num = item.AyatNumber ?? item.ayatNumber ?? 0;

    return (
      <TouchableOpacity
        onPress={() => onSelect(index)}
        activeOpacity={0.7}
        style={[styles.ayatContainer, active && styles.activeContainer]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.numberBadge, active && styles.activeBadge]}>
            <Text style={[styles.numberText, active && styles.activeText]}>
              {num === 0 ? '﷽' : num}
            </Text>
          </View>
          {item.surahName && (
            <Text style={styles.surahTag}>{item.surahName}</Text>
          )}
        </View>

        <Text style={[styles.arabicText, active && styles.activeArabic]}>
          {item.ArabicText}
        </Text>

        {item.urduText && (
          <Text style={styles.translationText}>{item.urduText}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      ref={listRef}
      data={ayats}
      keyExtractor={(_, i) => i.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listPadding}
      // 🛠️ Optimization: Is se scroll smooth aur fast hota hai
      getItemLayout={(data, index) => ({
        length: 120,
        offset: 120 * index,
        index,
      })}
      onScrollToIndexFailed={info => {
        // Agar list load na hui ho toh wait kar k scroll kare
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index: info.index, animated: true });
        }, 500);
      }}
    />
  );
};

const styles = StyleSheet.create({
  listPadding: {
    paddingBottom: 100, // Player controls ke liye jagah
  },
  ayatContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeContainer: {
    backgroundColor: '#F1F8E9', // Light Green highlight
    borderLeftWidth: 4,
    borderLeftColor: '#1F4037',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  numberBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#1F4037',
  },
  numberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  activeText: {
    color: '#fff',
  },
  surahTag: {
    fontSize: 10,
    color: '#1F4037',
    fontWeight: 'bold',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  arabicText: {
    fontSize: 24,
    color: '#333',
    textAlign: 'right', // Quran text RTL hota hai
    fontFamily: 'System', // Agar koi custom font hai toh wo lagayein
    lineHeight: 40,
  },
  activeArabic: {
    color: '#1F4037',
    fontWeight: 'bold',
  },
  translationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'left',
    fontStyle: 'italic',
  },
});

export default React.memo(AyatList);
