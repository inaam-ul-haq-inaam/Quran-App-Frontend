//useCreateChainController.js
import { useState } from 'react';
import { ToastAndroid, Alert } from 'react-native'; // 👈 Alert import kar liya!
import axios from 'axios';
import { BASE_URL } from '../../../Config/config';

export const useCreateChainController = navigation => {
  const [chainTitle, setChainTitle] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [startAyat, setStartAyat] = useState('');
  const [endAyat, setEndAyat] = useState('');
  const [chainItems, setChainItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);

  // 🛠️ Dummy Surahs
  const availableSurahs = [
    { id: 1, name: 'Al-Fatihah', totalAyats: 7 },
    { id: 2, name: 'Al-Baqarah', totalAyats: 286 },
    { id: 55, name: 'Ar-Rahman', totalAyats: 78 },
    { id: 112, name: 'Al-Ikhlas', totalAyats: 4 },
  ];

  // ➕ Item ko List (Cart) mein add karna
  const handleAddItem = () => {
    if (!selectedSurah) {
      ToastAndroid.show('Pehle Surah select karein', ToastAndroid.SHORT);
      return;
    }
    if (!startAyat) {
      ToastAndroid.show('Start Ayat likhna zaroori hai', ToastAndroid.SHORT);
      return;
    }

    const start = parseInt(startAyat);
    const end = endAyat ? parseInt(endAyat) : start;

    if (start > end) {
      ToastAndroid.show('Start Ayat badi nahi ho sakti', ToastAndroid.SHORT);
      return;
    }
    if (start < 1 || end > selectedSurah.totalAyats) {
      ToastAndroid.show(
        `Invalid! Is Surah mein sirf ${selectedSurah.totalAyats} Ayats hain`,
        ToastAndroid.SHORT,
      );
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      surahId: selectedSurah.id,
      surahName: selectedSurah.name,
      startAyat: start,
      endAyat: end,
    };

    setChainItems([...chainItems, newItem]);
    setStartAyat('');
    setEndAyat('');
    ToastAndroid.show('Ayat Added to Chain', ToastAndroid.SHORT);
  };

  // 🗑️ Galti se add hui item ko nikalna
  const handleRemoveItem = itemId => {
    setChainItems(chainItems.filter(item => item.id !== itemId));
  };

  // 💾 Final Save Button
  const handleSaveChain = async () => {
    if (isSaving) return;

    if (!chainTitle.trim()) {
      ToastAndroid.show('Chain ka naam likhna zaroori hai', ToastAndroid.SHORT);
      return;
    }
    if (chainItems.length === 0) {
      ToastAndroid.show(
        'Chain mein kam az kam 1 Ayat add karein',
        ToastAndroid.SHORT,
      );
      return;
    }

    setIsSaving(true);
    try {
      const details = chainItems.map((item, index) => ({
        surahId: item.surahId,
        startAyat: item.startAyat,
        endAyat: item.endAyat,
        playOrder: index + 1,
      }));

      const payload = {
        profileid: 1,
        reciterId: 1,
        title: chainTitle,
        details: details,
      };

      console.log('Sending Payload to API:', payload);

      const response = await axios.post(`${BASE_URL}/createChain`, payload);

      if (response.data.message === 'Chain created successfully') {
        ToastAndroid.show('Chain Successfully Saved! 🎉', ToastAndroid.SHORT);

        setIsSaving(false);
        setTimeout(() => {
          navigation?.goBack();
        }, 100);
      } else {
        let successMsg =
          response.data.message || 'Saved, lekin message nahi aya';
        ToastAndroid.show(String(successMsg), ToastAndroid.SHORT);
        setIsSaving(false);
      }
    } catch (error) {
      setIsSaving(false);

      // 🛡️ CRASH FIX: Pydantic Validation Errors ko theek se nikalna
      let errorMessage = 'Chain save karne mein masla aya';

      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          // FastAPI Pydantic errors yahan aate hain
          errorMessage = JSON.stringify(error.response.data.detail);
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Safe Alert jo object ki wajah se crash nahi hoga
      Alert.alert('Save Error 🚨', errorMessage);
    }
  };

  return {
    chainTitle,
    setChainTitle,
    selectedSurah,
    setSelectedSurah,
    startAyat,
    setStartAyat,
    endAyat,
    setEndAyat,
    chainItems,
    availableSurahs,
    isSaving,
    isSurahModalOpen,
    setIsSurahModalOpen,
    handleAddItem,
    handleRemoveItem,
    handleSaveChain,
  };
};
