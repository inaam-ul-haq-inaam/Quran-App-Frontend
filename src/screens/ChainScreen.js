import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ChainScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [list, setList] = useState([
    { id: '1', Title: '4 Qul', totalAyat: 10 },
    { id: '2', Title: 'Jadu / Protection', totalAyat: 15 },
    { id: '3', Title: 'Before Sleeping', totalAyat: 8 },
  ]);

  // Search Logic
  const filteredList = list.filter(item =>
    item.Title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderItem = ({ item }) => (
    <View style={ss.card}>
      <View style={ss.iconCircle}>
        <Ionicons name="link-outline" size={20} color="#008000" />
      </View>
      <View style={ss.infoSection}>
        <Text style={ss.itemTitle}>{item.Title}</Text>
        <Text style={ss.itemSubTitle}>{item.totalAyat} Ayats in Chain</Text>
      </View>
      <View style={ss.actionButtons}>
        <TouchableOpacity style={ss.playBtn}>
          <Ionicons name="play" size={18} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={ss.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={ss.container}>
      {/* Updated Header with Back & Search */}
      <View style={ss.header}>
        <View style={ss.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={ss.headerText}>My Quran Chains</Text>
          <View style={{ width: 24 }} /> {/* Balance for layout */}
        </View>

        <View style={ss.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search your chains..."
            placeholderTextColor="#999"
            style={ss.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            No chains found
          </Text>
        )}
      />

      <View style={ss.footer}>
        <TouchableOpacity
          style={ss.createBtn}
          onPress={() => navigation.navigate('newChain')}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={ss.createBtnText}>Create New Chain</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ss = StyleSheet.create({
  container: {
    backgroundColor: '#F0F4F0',
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#008000',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: '#333',
    fontSize: 15,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoSection: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemSubTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  playBtn: {
    backgroundColor: '#00ADEF',
    padding: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  footer: {
    padding: 20,
  },
  createBtn: {
    backgroundColor: '#008000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ChainScreen;
