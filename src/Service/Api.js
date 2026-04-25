// Api.js
import axios from 'axios';
import { BASE_URL } from '../Config/config';

// 1. Get Surah Ayats (POST)
export const getSurahAyats = async (
  surahId,
  fromAyat = null,
  toAyat = null,
) => {
  try {
    const url = `${BASE_URL}/get_Surah_Ayats`;
    console.log(`📡 Fetching Ayats: Surah ${surahId}`);

    const response = await axios.post(url, {
      surah_ID: surahId,
      reciterid: 1,
      fromAyat: fromAyat,
      toAyat: toAyat,
    });

    return response.data?.data || null;
  } catch (error) {
    console.error('❌ Surah Ayats API Error:', error.message);
    return null;
  }
};

// 2. Get Bayan Data (GET) - Axios mein convert kar diya consistency k liye
export const getBayanData = async surahId => {
  try {
    const url = `${BASE_URL}/BayanBySurah/${surahId}`;
    console.log(`📡 Fetching Bayan for Surah: ${surahId}`);

    const response = await axios.get(url);

    // Agar response mein .Bayans hai toh wo bhejain, warna poora data
    return response.data?.Bayans || response.data;
  } catch (error) {
    console.error('❌ Bayan API Error:', error.response?.data || error.message);
    return null;
  }
};

// 3. Get Chain Details (GET) - Handles ID and Name
export const getChainDetails = async identifier => {
  try {
    if (!identifier) {
      console.error('❌ Error: Identifier is missing');
      return [];
    }

    const isNumeric = /^\d+$/.test(identifier);
    console.log(
      `🚀 Calling Chain API - Type: ${
        isNumeric ? 'ID' : 'Name'
      }, Value: ${identifier}`,
    );

    // encodeURIComponent zaruri hai taake spaces handle ho sakain
    const url = `${BASE_URL}/getChainDetails/${encodeURIComponent(identifier)}`;
    const response = await axios.get(url);

    return response.data?.data || [];
  } catch (error) {
    console.error(
      '❌ Chain Details API Error:',
      error.response?.data || error.message,
    );
    return [];
  }
};
