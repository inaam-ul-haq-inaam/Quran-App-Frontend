import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
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
          onChangeText={handleSearch}
        />
      </View>

      {/* List Area */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#00ADEF" />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={item => item.BayanID.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <BayanCard item={item} onPressPlay={() => handlePlayBayan(item)} />
          )}
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

export default BayanListScreen;
