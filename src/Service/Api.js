// ============================================================
// API.JS - Complete API Service
// Handles: Surah Ayats, Bayan Data, Chain Details, Bookmarks
// ============================================================

import axios from 'axios';
import { BASE_URL } from '../Config/config';

// ============================================================
// 1. GET SURAH AYATS (with new response format)
// ============================================================
export const getSurahAyats = async (
  surahId,
  fromAyat = null,
  toAyat = null,
  reciterid = 1,
) => {
  try {
    // Validation
    if (!surahId) {
      console.error('❌ Error: Surah ID is missing');
      return null;
    }

    const url = `${BASE_URL}/get_Surah_Ayats`;
    console.log(`📡 Fetching Ayats: Surah ${surahId}`);

    const payload = {
      surah_ID: surahId,
      reciterid: reciterid,
      fromAyat: fromAyat,
      toAyat: toAyat,
    };

    const response = await axios.post(url, payload);

    // Return complete response with new format
    if (response.data && response.data.ayats) {
      return {
        status: response.data.status || 'success',
        surah_id: response.data.surah_id,
        surah_name: response.data.surah_name,
        surah_name_arabic: response.data.surah_name_arabic || '',
        surah_total_ayats: response.data.surah_total_ayats || 0,
        reciter_id: response.data.reciter_id || 1,
        reciter_name: response.data.reciter_name || 'Mishary Al-Afasy',
        range_from: response.data.range_from || 1,
        range_to:
          response.data.range_to || response.data.surah_total_ayats || 0,
        total_ayats_in_range: response.data.total_ayats_in_range || 0,
        ayats: response.data.ayats || [],
      };
    }

    console.warn('⚠️ No ayats data in response');
    return null;
  } catch (error) {
    console.error(
      '❌ Surah Ayats API Error:',
      error.response?.data || error.message,
    );
    return null;
  }
};

// ============================================================
// 2. GET BAYAN DATA
// ============================================================
// Api.js - Updated getBayanData with cache bypass

export const getBayanData = async surahId => {
  try {
    if (!surahId) {
      console.error('❌ Error: Surah ID is missing');
      return null;
    }

    const url = `${BASE_URL}/BayanBySurah/${surahId}`;
    console.log(`📡 Fetching Bayan for Surah: ${surahId}`);

    // 🔥 IMPORTANT: Add timestamp to prevent caching
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    if (response.data?.Bayans && response.data.Bayans.length > 0) {
      console.log(
        `✅ Found ${response.data.Bayans.length} bayans for surah ${surahId}`,
      );
      return response.data.Bayans;
    }

    if (response.data && Array.isArray(response.data)) {
      console.log(
        `✅ Found ${response.data.length} bayans for surah ${surahId}`,
      );
      return response.data;
    }

    console.warn('⚠️ No bayan data found');
    return null;
  } catch (error) {
    console.error('❌ Bayan API Error:', error.response?.data || error.message);
    return null;
  }
};

// ============================================================
// 3. GET CHAIN DETAILS (By ID or Name)
// ============================================================
export const getChainDetails = async identifier => {
  try {
    if (!identifier) {
      console.error('❌ Error: Identifier is missing');
      return [];
    }

    const isNumeric = /^\d+$/.test(identifier.toString());
    console.log(
      `🚀 Calling Chain API - Type: ${
        isNumeric ? 'ID' : 'Name'
      }, Value: ${identifier}`,
    );

    let url;
    if (isNumeric) {
      // If numeric, use ID endpoint
      url = `${BASE_URL}/getChainDetails/${identifier}`;
      console.log('📡 Request URL (by ID):', url);
    } else {
      // If string, use Name endpoint
      const encodedName = encodeURIComponent(identifier.trim());
      url = `${BASE_URL}/getChainByName/${encodedName}`;
      console.log('📡 Request URL (by Name):', url);
    }

    const response = await axios.get(url);

    // Check response structure
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Chain found, items:', response.data.data.length);
      return response.data.data;
    }

    if (response.data && Array.isArray(response.data)) {
      console.log(
        '✅ Chain found (array format), items:',
        response.data.length,
      );
      return response.data;
    }

    console.warn('⚠️ No data found for chain:', identifier);
    return [];
  } catch (error) {
    console.error(
      '❌ Chain Details API Error:',
      error.response?.data || error.message,
    );

    // Better error logging
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    return [];
  }
};

// ============================================================
// 4. GET CHAIN BY NAME (Fallback)
// ============================================================
export const getChainByName = async chainName => {
  try {
    if (!chainName) {
      console.error('❌ Error: Chain name is missing');
      return [];
    }

    const encodedName = encodeURIComponent(chainName.trim());
    const url = `${BASE_URL}/getChainByName/${encodedName}`;
    console.log('📡 Fetching chain by name:', url);

    const response = await axios.get(url);

    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log('✅ Chain found by name:', chainName);
      return response.data.data;
    }

    console.warn('⚠️ No chain found by name:', chainName);
    return [];
  } catch (error) {
    console.error(
      '❌ Get Chain By Name Error:',
      error.response?.data || error.message,
    );
    return [];
  }
};

// delete chain functions

export const deleteChainByName = async chainName => {
  try {
    const encodedName = encodeURIComponent(chainName.trim());
    const response = await axios.delete(
      `${BASE_URL}/deleteChainByName/${encodedName}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      '❌ Delete chain error:',
      error.response?.data || error.message,
    );
    return { message: 'Error deleting chain' };
  }
};

export const deleteAllChains = async profileId => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/deleteAllChains/${profileId}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      '❌ Delete all chains error:',
      error.response?.data || error.message,
    );
    return { message: 'Error deleting chains' };
  }
};

// ============================================================
// 5. SAVE BOOKMARK
// ============================================================
export const saveBookmark = async (
  profileId,
  surahId,
  reciterId,
  startAyat,
  endAyat,
  title,
) => {
  try {
    const payload = {
      profileid: profileId,
      surahid: surahId,
      reciterid: reciterId,
      startayat: startAyat,
      endayat: endAyat,
      title: title,
    };

    const response = await fetch(`${BASE_URL}/surahBookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📖 Bookmark save response:', data);
    return data;
  } catch (error) {
    console.error('❌ Save bookmark error:', error);
    return null;
  }
};

// ============================================================
// 6. GET BOOKMARKS
// ============================================================
export const getBookmarks = async profileId => {
  try {
    const url = `${BASE_URL}/getSurahbookmarks/${profileId}`;
    console.log('📡 Fetching bookmarks for profile:', profileId);

    const response = await axios.post(url);

    if (response.data?.bookmarks) {
      return response.data.bookmarks;
    }

    return [];
  } catch (error) {
    console.error(
      '❌ Get bookmarks error:',
      error.response?.data || error.message,
    );
    return [];
  }
};

// ============================================================
// 7. DELETE BOOKMARK
// ============================================================
export const deleteBookmark = async bookmarkId => {
  try {
    const url = `${BASE_URL}/deleteBookmark/${bookmarkId}`;
    console.log('📡 Deleting bookmark:', bookmarkId);

    const response = await axios.delete(url);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Delete bookmark error:',
      error.response?.data || error.message,
    );
    return null;
  }
};

// ============================================================
// 8. GET SURAH LIST
// ============================================================
export const getSurahList = async () => {
  try {
    const url = `${BASE_URL}/Surah`;
    console.log('📡 Fetching surah list');

    const response = await axios.get(url);

    if (response.data?.list) {
      return response.data.list;
    }

    return [];
  } catch (error) {
    console.error(
      '❌ Get surah list error:',
      error.response?.data || error.message,
    );
    return [];
  }
};

// ============================================================
// 9. CREATE CHAIN
// ============================================================
export const createChain = async (profileId, reciterId, title, details) => {
  try {
    const payload = {
      profileid: profileId,
      reciterId: reciterId,
      title: title,
      details: details,
    };

    console.log('📡 Creating chain:', title);
    const response = await axios.post(`${BASE_URL}/createChain`, payload);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Create chain error:',
      error.response?.data || error.message,
    );
    return null;
  }
};

// ============================================================
// 7. DELETE Chain
// ============================================================
export const deleteChain = async chainId => {
  try {
    const url = `${BASE_URL}/ddeleteChain/${chainId}`;
    console.log('📡 Deleting chain:', chainId);

    const response = await axios.delete(url);
    return response.data;
  } catch (error) {
    console.error(
      '❌ Delete chain error:',
      error.response?.data || error.message,
    );
    return null;
  }
};

// ============================================================
// EXPORTS
// ============================================================

export default {
  getSurahAyats,
  getBayanData,
  getChainDetails,
  getChainByName,
  saveBookmark,
  getBookmarks,
  deleteBookmark,
  getSurahList,
  createChain,
  deleteChain,
};
