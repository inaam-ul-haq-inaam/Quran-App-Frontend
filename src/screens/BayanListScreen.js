import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../Config/config';

const BayanListScreen = ({ navigation }) => {
  const [bayanList, setBayanList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchBayans = async () => {
    try {
      const API_URL = `${BASE_URL}/AllBayan`;
      const response = await axios.get(API_URL);

      // Check if data exists in response
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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{item.Title}</Text>
        <Text style={styles.ayatText}>
          {item.SurahName} (Ayat {item.StartAyatID}-{item.EndAyatID})
        </Text>

        <View style={styles.speakerRow}>
          <Ionicons
            name="mic-outline"
            size={14}
            color="#666"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.speakerText}>{item.ScholorName}</Text>
        </View>

        <Text style={styles.durationText}>{item.Duration}</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() =>
            navigation.navigate('AudioPlayerScreen', { data: item })
          }
        >
          <Ionicons
            name="play"
            size={20}
            color="white"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Islamic Lectures (Bayan)</Text>
        <View style={{ flexDirection: 'row' }}>
          <Ionicons
            name="mic-outline"
            size={24}
            color="#666"
            style={{ marginRight: 15 }}
          />
          <Ionicons name="settings-outline" size={24} color="#666" />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search by Surah or speaker..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={searchText}
          onChangeText={text => handleSearch(text)}
        />
      </View>

      {/* List with Loading */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#00ADEF" />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={item => item.BayanID.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <Text
              style={{ textAlign: 'center', marginTop: 20, color: '#9CA3AF' }}
            >
              Koi bayan nahi mila
            </Text>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: 'black',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ayatText: {
    fontSize: 14,
    color: '#008000',
    fontWeight: '600',
    marginBottom: 8,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  durationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rightSection: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00ADEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BayanListScreen;
