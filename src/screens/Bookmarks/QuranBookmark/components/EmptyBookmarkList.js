// components/EmptyBookmarkList.js
// Empty state component

import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { emptyStyles } from '../style';

const EmptyBookmarkList = () => {
  return (
    <View style={emptyStyles.container}>
      <Ionicons name="bookmark-outline" size={80} color="#ccc" />
      <Text style={emptyStyles.title}>No Bookmarks Yet</Text>
      <Text style={emptyStyles.subtitle}>
        Tap the bookmark button on player screen to save your favorite ayats
      </Text>
    </View>
  );
};

export default EmptyBookmarkList;
