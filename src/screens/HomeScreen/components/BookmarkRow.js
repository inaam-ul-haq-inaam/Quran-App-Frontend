// src/screens/Home/components/BookmarkRow.js
import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ss } from '../style';

const BookmarkRow = ({ title }) => (
  <View style={ss.bookmarkViews}>
    <Ionicons name="bookmark" size={20} />
    <Text style={ss.bookmarkTexts}>{title} BookMark</Text>
  </View>
);

export default BookmarkRow;
