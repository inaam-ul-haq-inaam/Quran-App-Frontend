import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ss } from './CreateChainStyles';
import { useCreateChainController } from './useCreateChainController';

const CreateChain = ({ navigation }) => {
  const {
    chainTitle,
    setChainTitle,
    selectedSurah,
    setSelectedSurah,
    startAyat,
    setStartAyat,
    endAyat,
    setEndAyat,
    chainItems,
    availableSurahs,
    isSaving,
    isSurahModalOpen,
    setIsSurahModalOpen,
    handleAddItem,
    handleRemoveItem,
    handleSaveChain,
  } = useCreateChainController(navigation);

  // 1️⃣ Card jo List mein nazar aayega
  const renderChainItem = ({ item, index }) => (
    <View style={ss.card}>
      <View>
        <Text style={ss.cardTitle}>
          {index + 1}. {item.surahName}
        </Text>
        <Text style={ss.cardSub}>
          {item.startAyat === item.endAyat
            ? `Ayat: ${item.startAyat}`
            : `Ayats: ${item.startAyat} - ${item.endAyat}`}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#FF4D4D" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={ss.container}>
      {/* HEADER */}
      <View style={ss.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={ss.headerText}>Create New Chain</Text>
      </View>

      {/* SURAH SELECTION */}
      <View style={ss.section}>
        <Text style={ss.label}>1. Select Surah</Text>
        <TouchableOpacity
          style={ss.selectorBox}
          onPress={() => setIsSurahModalOpen(true)}
        >
          <Text style={ss.selectorText}>
            {selectedSurah ? selectedSurah.name : 'Tap to select Surah...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* AYAT INPUTS */}
      <View style={ss.section}>
        <Text style={ss.label}>2. Select Ayats</Text>
        <View style={ss.row}>
          <TextInput
            style={ss.inputBox}
            placeholder="From Ayat (e.g. 1)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={startAyat}
            onChangeText={setStartAyat}
          />
          <TextInput
            style={ss.inputBox}
            placeholder="To Ayat (Optional)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={endAyat}
            onChangeText={setEndAyat}
          />
        </View>

        <TouchableOpacity style={ss.addBtn} onPress={handleAddItem}>
          <Text style={ss.addBtnText}>+ Add to Chain</Text>
        </TouchableOpacity>
      </View>

      {/* PREVIEW LIST (CART) */}
      <View style={ss.listContainer}>
        <Text style={ss.label}>Aapki Chain Preview:</Text>
        <FlatList
          data={chainItems}
          renderItem={renderChainItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
              Abhi tak koi ayat add nahi ki.
            </Text>
          }
        />
      </View>

      {/* BOTTOM SAVE SECTION */}
      <View style={ss.bottomBox}>
        <TextInput
          style={ss.titleInput}
          placeholder="Chain ka naam likhein (e.g. Daily Azkar)"
          placeholderTextColor="#999"
          value={chainTitle}
          onChangeText={setChainTitle}
        />
        <TouchableOpacity
          style={ss.saveBtn}
          onPress={handleSaveChain}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color="white" />
              <Text style={ss.saveBtnText}>Save Chain</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* SIMPLE SURAH PICKER MODAL */}
      <Modal
        visible={isSurahModalOpen}
        animationType="slide"
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: '60%',
            }}
          >
            <Text style={[ss.label, { fontSize: 18, marginBottom: 15 }]}>
              Surah Select Karein
            </Text>
            <FlatList
              data={availableSurahs}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 15,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}
                  onPress={() => {
                    setSelectedSurah(item);
                    setIsSurahModalOpen(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#333' }}>
                    {item.id}. {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                marginTop: 15,
                padding: 15,
                backgroundColor: '#eee',
                borderRadius: 10,
                alignItems: 'center',
              }}
              onPress={() => setIsSurahModalOpen(false)}
            >
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CreateChain;
