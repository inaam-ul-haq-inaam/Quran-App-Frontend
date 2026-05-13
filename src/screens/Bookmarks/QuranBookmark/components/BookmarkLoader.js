// components/BookmarkLoader.js
// Loading component

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { loaderStyles } from '../style';

const BookmarkLoader = () => {
  return (
    <View style={loaderStyles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={loaderStyles.text}>Loading bookmarks...</Text>
    </View>
  );
};

export default BookmarkLoader;
