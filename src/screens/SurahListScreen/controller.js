import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../Config/config';

export const useSurahController = navigation => {
  const [loading, setLoading] = useState(true);
  const [surahlist, setsurahList] = useState([]);
  const API_URL = `${BASE_URL}/Surah`;

  useEffect(() => {
    fetchSurahs();
  }, []);

  const fetchSurahs = async () => {
    try {
      const response = await axios.get(API_URL);
      if (response.data.list) {
        setsurahList(response.data.list);
      } else {
        Alert.alert('Error', 'Surah list data format is incorrect.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Server se connect nahi ho paya.');
    } finally {
      setLoading(false);
    }
  };

  const openPlayer = item => {
    // 🐞 Debugging ke liye: console mein check karein API kya keys bhej rahi hai
    console.log('🟢 Manual Click Item Data:', item);

    // ✅ Fallbacks laga diye hain (API jo bhi format bheje, ye catch kar lega)
    const sId = item.surahNumber || item.SurahID || item.id || item.Surah_ID;
    const sName =
      item.NameEnglish || item.surahName || item.name || item.SurahName;

    if (!sId || !sName) {
      Alert.alert(
        'Error',
        'Surah ka data theek se nahi mil raha. Console check karein.',
      );
      return;
    }

    // Ab perfectly wahi parameters ja rahe hain jo AudioPlayer ko chahiye
    navigation.navigate('AudioPlayerScreen', {
      surah_ID: sId,
      surahName: sName,
    });
  };

  return {
    loading,
    surahlist,
    openPlayer,
  };
};
