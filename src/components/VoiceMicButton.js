import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import VoiceService from '../Service/Listener';

const VoiceMicButton = () => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Service ke sath register hon ta ke status (Red/Green) pata chale
    VoiceService.registerButtonUpdates(status => {
      setIsListening(status);
    });
  }, []);

  const handlePress = () => {
    // Agar pehle se sun raha hai, to kuch mat karo (ya stop logic lagao)
    // Filhal hum sirf Start kar rahe hain
    if (!isListening) {
      VoiceService.startListening();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isListening ? styles.recording : styles.idle]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isListening ? 'square' : 'mic'}
          size={30}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  idle: {
    backgroundColor: '#008000', // 🟢 Green
  },
  recording: {
    backgroundColor: '#FF0000', // 🔴 Red
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default VoiceMicButton;
