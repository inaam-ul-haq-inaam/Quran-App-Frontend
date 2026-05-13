// services/bookmarkController.js
// All bookmark logic here

import axios from 'axios';
import { ToastAndroid, Alert } from 'react-native';
import { BASE_URL } from '../../../Config/config';

class BookmarkController {
  constructor() {
    this.profileId = 1; // Change as per auth
  }

  // Fetch all bookmarks
  async fetchBookmarks() {
    try {
      const response = await axios.post(
        `${BASE_URL}/getSurahbookmarks/${this.profileId}`,
      );

      if (response.data?.bookmarks) {
        console.log('📚 Bookmarks loaded:', response.data.bookmarks.length);
        return response.data.bookmarks;
      }
      return [];
    } catch (error) {
      console.error('Fetch bookmarks error:', error);
      ToastAndroid.show('Failed to load bookmarks', ToastAndroid.SHORT);
      return [];
    }
  }

  // Delete a bookmark
  async deleteBookmark(bookmarkId, title, onSuccess) {
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
              if (onSuccess) onSuccess();
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
  }

  // Get Surah ID from name
  getSurahIdFromName(name) {
    const surahMapping = {
      'Al-Fatihah': 1,
      'Al-Baqarah': 2,
      'Ar-Rahman': 55,
      'Al-Ikhlas': 112,
    };
    return surahMapping[name] || 1;
  }

  // Play bookmark
  playBookmark(item, navigation) {
    navigation.navigate('Quran', {
      screen: 'AudioPlayerScreen',
      params: {
        surah_ID: item.surahId || this.getSurahIdFromName(item.NameEnglish),
        surahName: item.NameEnglish,
        startFromAyat: item.FromAyat,
        isBookmark: true,
        bookmarkTitle: item.title,
      },
    });
  }
}

export default new BookmarkController();
