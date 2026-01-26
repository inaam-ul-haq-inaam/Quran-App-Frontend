import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SurahListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [surahlist, setsurahList] = useState([]);
  const API_URL = 'http://192.168.30.150:8000/Surah';

  useEffect(() => {
    fetchSurahs();
  }, []);

  const fetchSurahs = async () => {
    try {
      console.log('Fetching from:', API_URL);
      const response = await axios.get(API_URL);

      if (response.data.list) {
        setsurahList(response.data.list);
        console.log('Surahs fetched successfully');
      } else {
        console.log('Data format issue:', response.data);
        Alert.alert('Error', 'Surah list data format is incorrect.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert(
        'Error',
        'Server se connect nahi ho paya. Internet ya IP check karein.',
      );
    } finally {
      setLoading(false);
    }
  };

  const openPlayer = item => {
    // Ensure required fields exist
    if (!item || !item.surahNumber || !item.NameEnglish) {
      Alert.alert('Error', 'Invalid Surah data.');
      return;
    }

    navigation.navigate('AudioPlayerScreen', {
      surah_ID: item.surahNumber, // 🔹 backend ke liye exact field
      surahName: item.englishText,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openPlayer(item)}>
      <View style={styles.numberContainer}>
        <Text style={styles.numberText}>{item.surahNumber}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{item.NameEnglish}</Text>
        <Text style={styles.subTitleText}>{item.NameArabic}</Text>
        <Text style={styles.subTitleText}>Total Ayats: {item.TotalAyat}</Text>
      </View>

      <Ionicons name="play-circle" size={30} color="#0D3B33" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 15 }}>
      {loading ? (
        <View
          style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
        >
          <Text>Loading .....</Text>
        </View>
      ) : (
        <FlatList
          data={surahlist}
          renderItem={renderItem}
          keyExtractor={item => item.surahNumber.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: { color: '#008000', fontWeight: 'bold' },
  textContainer: { flex: 1 },
  titleText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  subTitleText: { fontSize: 14, color: 'gray' },
});

export default SurahListScreen;
