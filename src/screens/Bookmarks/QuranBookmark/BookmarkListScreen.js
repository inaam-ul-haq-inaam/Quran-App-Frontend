// BookmarkListScreen.js - UPDATED with title support

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../../../Config/config';

const BookmarkListScreen = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const profileId = 1; // Change as per your auth

  // ============================================================
  // Fetch Bookmarks from Backend
  // ============================================================
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/getSurahbookmarks/${profileId}`,
      );

      if (response.data?.bookmarks) {
        setBookmarks(response.data.bookmarks);
        console.log('📚 Bookmarks loaded:', response.data.bookmarks.length);
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      console.error('Fetch bookmarks error:', error);
      ToastAndroid.show('Failed to load bookmarks', ToastAndroid.SHORT);
      setBookmarks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // Delete Bookmark (requires delete endpoint)
  // ============================================================
  const deleteBookmark = async (bookmarkId, title) => {
    Alert.alert('Delete Bookmark', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await axios.delete(
              `${BASE_URL}/deleteBookmark/${bookmarkId}`,
            );
            if (response.data?.message === 'Bookmark deleted successfully') {
              ToastAndroid.show('Bookmark deleted', ToastAndroid.SHORT);
              fetchBookmarks(); // Refresh list
            } else {
              ToastAndroid.show('Delete failed', ToastAndroid.SHORT);
            }
          } catch (error) {
            console.error('Delete error:', error);
            ToastAndroid.show('Error deleting bookmark', ToastAndroid.SHORT);
          }
        },
      },
    ]);
  };

  // ============================================================
  // Play Bookmark
  // ============================================================
  const playBookmark = item => {
    navigation.navigate('Quran', {
      screen: 'AudioPlayerScreen',
      params: {
        surah_ID: item.surahId || getSurahIdFromName(item.NameEnglish),
        surahName: item.NameEnglish,
        startFromAyat: item.FromAyat,
        isBookmark: true,
        bookmarkTitle: item.title,
      },
    });
  };

  // Helper: Get Surah ID from name (you may have a mapping)
  const getSurahIdFromName = name => {
    const surahMapping = {
      'Al-Fatihah': 1,
      'Al-Baqarah': 2,
      'Ar-Rahman': 55,
      'Al-Ikhlas': 112,
    };
    return surahMapping[name] || 1;
  };

  // ============================================================
  // Render Each Bookmark Item
  // ============================================================
  const renderBookmarkItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.bookmarkCard}
      onPress={() => playBookmark(item)}
      onLongPress={() => deleteBookmark(item.bookmarkId, item.title)}
    >
      <View style={styles.cardContent}>
        <View style={styles.bookmarkIcon}>
          <Ionicons name="bookmark" size={24} color="#4CAF50" />
        </View>

        <View style={styles.bookmarkInfo}>
          {/* 👈 TITLE SHOW HOGA */}
          <Text style={styles.bookmarkTitle} numberOfLines={1}>
            {item.title || `${item.NameEnglish} - Ayat ${item.FromAyat}`}
          </Text>

          <View style={styles.bookmarkDetails}>
            <Text style={styles.surahName}>
              {item.NameEnglish} ({item.NameArabic})
            </Text>
            <Text style={styles.ayatRange}>
              {item.FromAyat === item.ToAyat
                ? `Ayat ${item.FromAyat}`
                : `Ayat ${item.FromAyat} - ${item.ToAyat}`}
            </Text>
          </View>

          <Text style={styles.totalAyats}>Total Ayats: {item.TotalAyats}</Text>
        </View>

        <TouchableOpacity
          onPress={() => deleteBookmark(item.bookmarkId, item.title)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ============================================================
  // Empty List Component
  // ============================================================
  const EmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={80} color="#ccc" />
      <Text style={styles.emptyText}>No Bookmarks Yet</Text>
      <Text style={styles.emptySubText}>
        Tap the bookmark button on player screen to save your favorite ayats
      </Text>
    </View>
  );

  // ============================================================
  // Header Component
  // ============================================================
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Bookmarks</Text>
      <Text style={styles.bookmarkCount}>{bookmarks.length}</Text>
    </View>
  );

  // ============================================================
  // Initial Load
  // ============================================================
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // ============================================================
  // Main Render
  // ============================================================
  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loaderText}>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <FlatList
        data={bookmarks}
        renderItem={renderBookmarkItem}
        keyExtractor={(item, index) =>
          item.bookmarkId?.toString() || index.toString()
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyList}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchBookmarks();
        }}
      />
    </View>
  );
};

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookmarkCount: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  bookmarkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  bookmarkIcon: {
    marginRight: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bookmarkDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  surahName: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 10,
  },
  ayatRange: {
    fontSize: 12,
    color: '#888',
  },
  totalAyats: {
    fontSize: 10,
    color: '#aaa',
  },
  deleteBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default BookmarkListScreen;
