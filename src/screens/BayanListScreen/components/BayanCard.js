import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../style';

const BayanCard = ({ item, onPressPlay }) => {
  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>{item.Title}</Text>
        <Text style={styles.ayatText}>
          {item.SurahName} (Ayat {item.StartAyatID}-{item.EndAyatID})
        </Text>

        <View style={styles.speakerRow}>
          <Ionicons
            name="mic-outline"
            size={14}
            color="#666"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.speakerText}>{item.ScholorName}</Text>
        </View>

        <Text style={styles.durationText}>{item.Duration}</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={onPressPlay}>
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

export default BayanCard;
