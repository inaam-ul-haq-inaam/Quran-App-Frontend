// components/BookmarkHeader.js
// Header component

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { headerStyles } from '../style';

const BookmarkHeader = ({ title, count, onBack }) => {
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity onPress={onBack} style={headerStyles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={headerStyles.title}>{title}</Text>
      <Text style={headerStyles.count}>{count}</Text>
    </View>
  );
};

export default BookmarkHeader;
