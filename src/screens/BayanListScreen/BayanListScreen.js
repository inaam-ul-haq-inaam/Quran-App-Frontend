import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './style';
import BayanCard from './components/BayanCard';
import { useBayanController } from './controller';

const BayanListScreen = ({ navigation }) => {
  const { filteredList, loading, searchText, handleSearch, handlePlayBayan } =
    useBayanController(navigation);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header - Styled like Quran Screen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Islamic Bayans</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Ionicons name="mic-outline" size={22} color="#636E72" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="filter-outline" size={22} color="#636E72" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search speaker or topic..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* List Area */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#065F46" />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={item => item.BayanID.toString()}
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
          renderItem={({ item }) => (
            <BayanCard item={item} onPressPlay={() => handlePlayBayan(item)} />
          )}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 50, alignItems: 'center' }}>
              <Ionicons name="search-outline" size={50} color="#E5E7EB" />
              <Text style={{ marginTop: 10, color: '#9CA3AF', fontSize: 16 }}>
                Koi bayan nahi mila
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default BayanListScreen;
