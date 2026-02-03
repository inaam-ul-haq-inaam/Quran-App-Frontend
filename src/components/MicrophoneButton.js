// File Location: src/components/MicrophoneButton.js

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VoiceService from '../Service/Listener'; // 👈 Import Listener

const MicrophoneButton = () => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Service se status pucho
    VoiceService.registerButtonUpdates(status => {
      setIsListening(status);
    });
  }, []);

  const handlePress = async () => {
    if (!isListening) {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        } catch (e) {
          return;
        }
      }

      // Listener ko bolo: Mic Chalao!
      VoiceService.startListening();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.micBtn, isListening && styles.micActive]}
      onPress={handlePress}
    >
      <Ionicons
        name={isListening ? 'square' : 'mic'}
        size={30}
        color={isListening ? '#fff' : '#0D3B33'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  micBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 999,
  },
  micActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff0000',
  },
});

export default MicrophoneButton;
