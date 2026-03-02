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
    if (!item || !item.surahNumber || !item.NameEnglish) {
      Alert.alert('Error', 'Invalid Surah data.');
      return;
    }
    navigation.navigate('AudioPlayerScreen', {
      surah_ID: item.surahNumber,
      surahName: item.NameEnglish,
    });
  };

  return {
    loading,
    surahlist,
    openPlayer,
  };
};
