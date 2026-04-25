import { useState, useCallback } from 'react';
import { ToastAndroid, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../../Config/config';

// 🚀 FIX: Yahan 'navigation' pass karna lazmi hai
export const useChainController = (navigation, profileId = 1) => {
  const [searchText, setSearchText] = useState('');
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChains = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/getChains/${profileId}`);
      if (response.data && response.data.data) {
        const formattedChains = response.data.data.map(chain => {
          const totalAyats = chain.details.reduce((sum, detail) => {
            return sum + (detail.endAyat - detail.startAyat + 1);
          }, 0);

          return {
            ...chain,
            totalAyat: totalAyats,
          };
        });
        setList(formattedChains);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error('Fetch Error:', error.message);
      ToastAndroid.show('Chains load karne mein masla aya', ToastAndroid.SHORT);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChains();
    }, [profileId]),
  );

  const filteredList = list.filter(item =>
    item.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // 🚀 PLAY LOGIC: Yeh PlayerScreen ko data bhej rahi hai
  const handlePlayChain = item => {
    // 🔍 Check karein console mein ke exact key kya hai?
    console.log('Selected Item Object:', item);

    navigation.navigate('AudioPlayerScreen', {
      type: 'chain',
      // Agar backend se ChainID (Capital) aa raha hai toh wahi likhna hoga
      chainId: item.chainId || item.ChainID || item.id,
      chainTitle: item.chainName || item.title,
    });
  };

  const handleDeleteChain = chainId => {
    Alert.alert(
      'Delete Chain 🗑️',
      'Kya aap waqai is chain ko delete karna chahte hain?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${BASE_URL}/deleteChain/${chainId}`,
              );
              if (response.data.message === 'Chain deleted successfully') {
                ToastAndroid.show('Chain Deleted!', ToastAndroid.SHORT);
                setList(prev => prev.filter(i => i.chainId !== chainId));
              }
            } catch (error) {
              ToastAndroid.show('Delete nahi ho saka', ToastAndroid.SHORT);
            }
          },
        },
      ],
    );
  };

  return {
    searchText,
    setSearchText,
    filteredList,
    isLoading,
    handlePlayChain,
    handleDeleteChain,
    fetchChains,
  };
};
