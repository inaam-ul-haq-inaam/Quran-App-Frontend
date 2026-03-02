import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../Config/config';

export const useBayanController = navigation => {
  const [bayanList, setBayanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchBayans = async () => {
    try {
      const API_URL = `${BASE_URL}/AllBayan`;
      const response = await axios.get(API_URL);
      const data = response.data.Bayans || [];
      setBayanList(data);
      setFilteredList(data);
    } catch (error) {
      console.error('Axios Error:', error);
      alert('Database se data nahi mil saka. Connection check karein.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBayans();
  }, []);

  const handleSearch = text => {
    setSearchText(text);
    const filtered = bayanList.filter(item => {
      const itemData =
        `${item.Title} ${item.SurahName} ${item.ScholorName}`.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredList(filtered);
  };

  const handlePlayBayan = item => {
    const index = filteredList.findIndex(x => x.BayanID === item.BayanID);
    navigation.navigate('BayanPlayer', {
      bayanList: filteredList,
      initialIndex: index,
    });
  };

  return {
    filteredList,
    loading,
    searchText,
    handleSearch,
    handlePlayBayan,
  };
};
