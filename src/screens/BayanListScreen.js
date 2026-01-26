import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BayanListScreen = ({ navigation }) => {
  const [bayanList, setBayanList] = useState([
    {
      id: '1',
      title: 'Surah Al-Baqarah',
      ayat: 'Ayat 1-20',
      speaker: 'Mufti Taqi Usmani',
      duration: '1:15:30',
      isFav: true,
    },
    {
      id: '2',
      title: 'Surah Al-Baqarah',
      ayat: 'Ayat 21-40',
      speaker: 'Mufti Taqi Usmani',
      duration: '1:22:10',
      isFav: false,
    },
    {
      id: '3',
      title: 'Surah Al-Araf',
      ayat: 'Ayat 130-166',
      speaker: 'Maulana Tariq Jameel',
      duration: '45:12',
      isFav: true,
    },
    {
      id: '4',
      title: 'Surah Yasin',
      ayat: 'Full Surah',
      speaker: 'Dr. Israr Ahmed',
      duration: '2:30:00',
      isFav: false,
    },
  ]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.ayatText}>{item.ayat}</Text>

          <View style={styles.speakerRow}>
            <Ionicons
              name="mic-outline"
              size={14}
              color="#666"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.speakerText}>{item.speaker}</Text>
          </View>

          <Text style={styles.durationText}>{item.duration}</Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity>
            <Ionicons
              name={item.isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={item.isFav ? '#FF4D4D' : '#9CA3AF'}
            />
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
  };

  return (
    <View style={styles.container}>
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
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      <FlatList
        data={bayanList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
    color: '#6B7280', // Gray
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
