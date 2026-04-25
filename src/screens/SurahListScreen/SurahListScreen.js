import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './style';
import { useSurahController } from './controller';
import SurahCard from './components/SurahCard';

const SurahListScreen = ({ navigation }) => {
  const { loading, surahlist, openPlayer } = useSurahController(navigation);
  const [search, setSearch] = useState('');

  // Search filter logic
  const filteredList = surahlist?.filter(
    item =>
      item?.NameEnglish?.toLowerCase().includes(search.toLowerCase()) ||
      item?.surahNumber?.toString().includes(search),
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#065F46" />
        <Text style={{ marginTop: 10, color: '#636E72' }}>
          Loading Surahs...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- Custom Header & Search --- */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color="#2D3436"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Holy Quran</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#636E72" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Surah (e.g. Al-Fatiha)"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#95A5A6"
          />
        </View>
      </View>

      {/* --- List --- */}
      <FlatList
        data={filteredList}
        renderItem={({ item }) => (
          <SurahCard item={item} onPress={() => openPlayer(item)} />
        )}
        keyExtractor={item => item.surahNumber.toString()}
        contentContainerStyle={{ paddingVertical: 15 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text
            style={{ textAlign: 'center', marginTop: 50, color: '#636E72' }}
          >
            No Surah found.
          </Text>
        }
      />
    </View>
  );
};

export default SurahListScreen;
