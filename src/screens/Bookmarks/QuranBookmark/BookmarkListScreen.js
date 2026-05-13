// screens/BookmarkListScreen.js
// Main bookmark list screen - Clean version

import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import BookmarkHeader from './components/BookmarkHeader';
import BookmarkCard from './components/BookmarkCard';
import EmptyBookmarkList from './components/EmptyBookmarkList';
import BookmarkLoader from './components/BookmarkLoader';

// Import controller
import BookmarkController from './bookmarkController';

// Import styles
import { screenStyles } from './style';

const BookmarkListScreen = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load bookmarks
  const loadBookmarks = async () => {
    setLoading(true);
    const data = await BookmarkController.fetchBookmarks();
    setBookmarks(data);
    setLoading(false);
    setRefreshing(false);
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, []),
  );

  // Handle delete
  const handleDelete = item => {
    BookmarkController.deleteBookmark(item.bookmarkId, item.title, () => {
      loadBookmarks();
    });
  };

  // Handle play
  const handlePlay = item => {
    BookmarkController.playBookmark(item, navigation);
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
  };

  // Render item
  const renderItem = ({ item, index }) => (
    <BookmarkCard
      item={item}
      index={index}
      onPress={() => handlePlay(item)}
      onLongPress={() => handleDelete(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  // Loading state
  if (loading && !refreshing) {
    return <BookmarkLoader />;
  }

  return (
    <View style={screenStyles.container}>
      <BookmarkHeader
        title="My Bookmarks"
        count={bookmarks.length}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.bookmarkId?.toString() || index.toString()
        }
        contentContainerStyle={screenStyles.listContent}
        ListEmptyComponent={EmptyBookmarkList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default BookmarkListScreen;
