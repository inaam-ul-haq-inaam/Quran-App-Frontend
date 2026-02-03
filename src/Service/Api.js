import axios from 'axios';
import { BASE_URL } from '../Config/config';

export const getSurahAyats = async surahId => {
  try {
    const url = `${BASE_URL}/get_Surah_Ayats`;

    console.log(`📡 Connecting to: ${url}`);

    const response = await axios.post(url, {
      surah_ID: surahId,
      reciterid: 1,
    });

    if (response.data && response.data.data) {
      console.log(`✅ Data Received: ${response.data.data.length} Ayats`);
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return null;
  }
};
