import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../style';

const SurahCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.numberContainer}>
      <Text style={styles.numberText}>{item.surahNumber}</Text>
    </View>

    <View style={styles.textContainer}>
      <Text style={styles.titleText}>
        {item.NameEnglish.split('(')[0].trim()}
      </Text>
      <Text style={styles.subTitleText}>{item.NameArabic}</Text>
      <Text style={styles.ssubTitleText}>Total Ayats: {item.TotalAyat}</Text>
    </View>

    <Ionicons name="play-circle" size={30} color="#0D3B33" />
  </TouchableOpacity>
);

export default SurahCard;
