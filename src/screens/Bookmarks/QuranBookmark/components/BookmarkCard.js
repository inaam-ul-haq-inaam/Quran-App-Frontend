// components/BookmarkCard.js
// Reusable bookmark card component

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { bookmarkCardStyles } from '../style';

const BookmarkCard = ({ item, index, onPress, onLongPress, onDelete }) => {
  return (
    <TouchableOpacity
      style={bookmarkCardStyles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={bookmarkCardStyles.cardContent}>
        {/* Bookmark Icon */}
        <View style={bookmarkCardStyles.iconContainer}>
          <Ionicons name="bookmark" size={24} color="#4CAF50" />
        </View>

        {/* Bookmark Info */}
        <View style={bookmarkCardStyles.infoContainer}>
          <Text style={bookmarkCardStyles.title} numberOfLines={1}>
            {item.title || `${item.NameEnglish} - Ayat ${item.FromAyat}`}
          </Text>

          <View style={bookmarkCardStyles.detailsRow}>
            <Text style={bookmarkCardStyles.surahName}>
              {item.NameEnglish} ({item.NameArabic})
            </Text>
            <Text style={bookmarkCardStyles.ayatRange}>
              {item.FromAyat === item.ToAyat
                ? `Ayat ${item.FromAyat}`
                : `Ayat ${item.FromAyat} - ${item.ToAyat}`}
            </Text>
          </View>

          <Text style={bookmarkCardStyles.totalAyats}>
            Total Ayats: {item.TotalAyats}
          </Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={onDelete}
          style={bookmarkCardStyles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default BookmarkCard;
