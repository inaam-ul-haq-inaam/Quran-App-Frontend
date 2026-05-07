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

//  getChainDetails

export const getChainDetails = async identifier => {
  try {
    if (!identifier) {
      console.error('❌ Error: Identifier is missing');
      return [];
    }

    const isNumeric = /^\d+$/.test(identifier.toString());

    let url;
    if (isNumeric) {
      // If numeric, use ID endpoint
      url = `${BASE_URL}/getChainDetails/${identifier}`;
      console.log('🚀 Fetching chain by ID:', identifier);
    } else {
      // If string, use name endpoint
      const encodedName = encodeURIComponent(identifier.trim());
      url = `${BASE_URL}/getChainByName/${encodedName}`;
      console.log('🚀 Fetching chain by Name:', identifier, 'URL:', url);
    }

    const response = await axios.get(url);

    // Check response
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Chain found, items:', response.data.data.length);
      return response.data.data;
    } else {
      console.warn('⚠️ No data found for chain:', identifier);
      return [];
    }
  } catch (error) {
    console.error(
      '❌ Chain Details API Error:',
      error.response?.data || error.message,
    );
    return [];
  }
};
