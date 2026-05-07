// ============================================================
// CREATE CHAIN SCREEN
// Supports: Manual input + Voice commands
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ss } from './CreateChainStyles';
import { useCreateChainController } from './useCreateChainController';
import { useRoute, useFocusEffect } from '@react-navigation/native';

const CreateChain = ({ navigation }) => {
  // ============================================================
  // SECTION 1: Existing Controller Hooks (No Change)
  // ============================================================
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

  // ============================================================
  // SECTION 2: Voice Command State
  // ============================================================
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const route = useRoute();

  // ============================================================
  // SECTION 3: Handle Voice Actions from Navigation Params
  // VoiceCommandController se actions yahan aayenge
  // ============================================================
  useFocusEffect(
    React.useCallback(() => {
      // Check if screen was opened with voice params
      const params = route.params;
      if (params?.voiceAction) {
        handleVoiceAction(params.voiceAction, params);
        // Clear params after processing (avoid duplicate)
        navigation.setParams({ voiceAction: null });
      }
    }, [route.params]),
  );

  // ============================================================
  // SECTION 4: Voice Action Handler
  // ============================================================
  const handleVoiceAction = (action, data) => {
    console.log('🎤 Voice Action in CreateChain:', action, data);

    switch (action) {
      // 4.1 - SELECT SURAH (e.g., "select surah fathiha")
      case 'select_surah':
        if (data.surahName) {
          selectSurahByName(data.surahName);
        }
        break;

      // 4.2 - SELECT AYAT (e.g., "select ayat 5" or "select ayat 3 to 8")
      case 'select_ayat':
        if (data.fromAyat) {
          setStartAyat(data.fromAyat.toString());
          if (data.toAyat) {
            setEndAyat(data.toAyat.toString());
          } else {
            setEndAyat('');
          }
          const feedbackMsg = data.toAyat
            ? `Ayat ${data.fromAyat} to ${data.toAyat} selected`
            : `Ayat ${data.fromAyat} selected`;
          setVoiceFeedback(feedbackMsg);
          ToastAndroid.show(feedbackMsg, ToastAndroid.SHORT);
          setTimeout(() => setVoiceFeedback(''), 2000);
        }
        break;

      // 4.3 - ADD TO LIST (e.g., "add to list")
      case 'add_to_list':
        handleAddItem();
        setVoiceFeedback('✅ Added to chain');
        ToastAndroid.show('Added to chain', ToastAndroid.SHORT);
        setTimeout(() => setVoiceFeedback(''), 2000);
        break;

      // 4.4 - SET TITLE (e.g., "title morning chain")
      case 'set_title':
        if (data.title) {
          setChainTitle(data.title);
          setVoiceFeedback(`✅ Title: ${data.title}`);
          ToastAndroid.show(`Title set: ${data.title}`, ToastAndroid.SHORT);
          setTimeout(() => setVoiceFeedback(''), 2000);
        }
        break;

      // 4.5 - SAVE CHAIN (e.g., "save chain")
      case 'save_chain':
        handleSaveChain();
        break;

      // 4.6 - REMOVE LAST ITEM (e.g., "remove last")
      case 'remove_last':
        if (chainItems.length > 0) {
          const lastItem = chainItems[chainItems.length - 1];
          handleRemoveItem(lastItem.id);
          setVoiceFeedback('🗑️ Last item removed');
          ToastAndroid.show('Last item removed', ToastAndroid.SHORT);
          setTimeout(() => setVoiceFeedback(''), 2000);
        } else {
          setVoiceFeedback('❌ Chain is empty');
          ToastAndroid.show('Chain is empty', ToastAndroid.SHORT);
          setTimeout(() => setVoiceFeedback(''), 2000);
        }
        break;

      // 4.7 - CLEAR ALL ITEMS (e.g., "clear all")
      case 'clear_all':
        if (chainItems.length > 0) {
          // Clear all items one by one
          chainItems.forEach(item => handleRemoveItem(item.id));
          setVoiceFeedback('🗑️ All items cleared');
          ToastAndroid.show('All items cleared', ToastAndroid.SHORT);
          setTimeout(() => setVoiceFeedback(''), 2000);
        }
        break;

      // 4.8 - SHOW CURRENT LIST (e.g., "show list")
      case 'show_list':
        if (chainItems.length === 0) {
          setVoiceFeedback('Chain is empty. Say "select surah" to start');
          ToastAndroid.show('Chain is empty', ToastAndroid.SHORT);
        } else {
          const itemCount = chainItems.length;
          setVoiceFeedback(
            `Chain has ${itemCount} item${itemCount > 1 ? 's' : ''}`,
          );
          ToastAndroid.show(`${itemCount} items in chain`, ToastAndroid.SHORT);
        }
        setTimeout(() => setVoiceFeedback(''), 3000);
        break;

      // 4.9 - CANCEL CHAIN (e.g., "cancel chain")
      case 'cancel_chain':
        setVoiceFeedback('❌ Chain creation cancelled');
        ToastAndroid.show('Chain creation cancelled', ToastAndroid.SHORT);
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
        break;

      default:
        console.log('Unknown voice action:', action);
    }
  };

  // ============================================================
  // SECTION 5: Helper - Select Surah by Name
  // ============================================================
  const selectSurahByName = surahName => {
    const searchName = surahName.toLowerCase();

    // Surah name mapping for voice recognition
    const surahMapping = {
      fathiha: 1,
      fatiha: 1,
      baqarah: 2,
      rehman: 55,
      rahman: 55,
      ikhlas: 112,
      nas: 114,
      falaq: 113,
    };

    let surahId = surahMapping[searchName];

    // If not in mapping, try partial match
    if (!surahId) {
      const found = availableSurahs.find(
        s =>
          s.name.toLowerCase().includes(searchName) ||
          searchName.includes(s.name.toLowerCase().split(' ')[0]),
      );
      if (found) {
        surahId = found.id;
      }
    }

    // Select the surah
    if (surahId) {
      const surah = availableSurahs.find(s => s.id === surahId);
      if (surah) {
        setSelectedSurah(surah);
        setVoiceFeedback(`✅ ${surah.name} selected`);
        ToastAndroid.show(`${surah.name} selected`, ToastAndroid.SHORT);
        setTimeout(() => setVoiceFeedback(''), 2000);
      } else {
        setVoiceFeedback(`❌ Surah "${surahName}" not found`);
        ToastAndroid.show(`Surah "${surahName}" not found`, ToastAndroid.SHORT);
        setTimeout(() => setVoiceFeedback(''), 2000);
      }
    } else {
      setVoiceFeedback(`❌ Surah "${surahName}" not recognized`);
      ToastAndroid.show(
        `Surah "${surahName}" not recognized`,
        ToastAndroid.SHORT,
      );
      setTimeout(() => setVoiceFeedback(''), 2000);
    }
  };

  // ============================================================
  // SECTION 6: Render Chain Item (Existing - No Change)
  // ============================================================
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

  // ============================================================
  // SECTION 7: Main Render (Existing UI + Voice Feedback)
  // ============================================================
  return (
    <View style={ss.container}>
      {/* HEADER */}
      <View style={ss.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={ss.headerText}>Create New Chain</Text>
      </View>

      {/* 🆕 VOICE FEEDBACK BANNER */}
      {voiceFeedback !== '' ? (
        <View
          style={{
            backgroundColor: '#4CAF50',
            padding: 10,
            marginHorizontal: 15,
            marginTop: 10,
            borderRadius: 10,
          }}
        >
          <Text
            style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}
          >
            🎙️ {voiceFeedback}
          </Text>
        </View>
      ) : null}

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
              Voice bolein: "Select surah fathiha", "Select ayat 3", "Add to
              list"
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

      {/* SURAH PICKER MODAL (Existing - No Change) */}
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
