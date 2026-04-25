import React from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ss } from './ChainScreenStyles'; // Apne folder path k hisaab se theek karein
import { useChainController } from './useChainController'; // Controller Import

const ChainScreen = ({ navigation }) => {
  // Controller se data aur functions nikal liye
  const {
    searchText,
    setSearchText,
    filteredList,
    isLoading,
    handlePlayChain,
    handleDeleteChain,
  } = useChainController(navigation, 1); // 1 is default profileId

  const renderItem = ({ item }) => (
    <View style={ss.card}>
      <View style={ss.iconCircle}>
        <Ionicons name="link-outline" size={20} color="white" />
      </View>
      <View style={ss.infoSection}>
        {/* API lowercase 'title' bhej rahi hai */}
        <Text style={ss.itemTitle}>{item.title}</Text>
        <Text style={ss.itemSubTitle}>{item.totalAyat} Ayats in Chain</Text>
      </View>
      <View style={ss.actionButtons}>
        <TouchableOpacity
          style={ss.playBtn}
          onPress={() => handlePlayChain(item)}
        >
          <Ionicons name="play" size={18} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={ss.deleteBtn}
          onPress={() => handleDeleteChain(item.chainId)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={ss.container}>
      <View style={ss.header}>
        <View style={ss.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={ss.headerText}>My Quran Chains</Text>
          <View style={{ width: 24 }} />
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

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#008000" />
          <Text style={ss.loadingText}>Loading Chains...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={item => item.chainId.toString()} // API se 'chainId' aa raha hai
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
              No chains found
            </Text>
          )}
        />
      )}

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

export default ChainScreen;
