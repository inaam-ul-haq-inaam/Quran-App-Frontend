// AyatList.js
import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';

export default function AyatList({ ayats, currentIndex, onSelect }) {
  return (
    <FlatList
      data={ayats}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item, index }) => {
        const active = index === currentIndex;
        const num = item.AyatNumber ?? 0;

        return (
          <TouchableOpacity
            onPress={() => onSelect(index)}
            style={{
              padding: 15,
              backgroundColor: active ? '#E8F5E9' : '#fff',
            }}
          >
            <Text>{num === 0 ? 'Bismillah' : num}</Text>
            <Text>{item.ArabicText}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}
