import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SurahCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    {/* Left: Surah Number with stylized background */}
    <View style={styles.numberContainer}>
      <Text style={styles.numberText}>{item.surahNumber}</Text>
    </View>

    {/* Center: English Name and Details */}
    <View style={styles.textContainer}>
      <Text style={styles.titleText}>
        {item.NameEnglish.split('(')[0].trim()}
      </Text>
      <View style={styles.detailRow}>
        <Ionicons name="document-text-outline" size={12} color="#636E72" />
        <Text style={styles.subTitleText}> {item.TotalAyat} Ayats</Text>
      </View>
    </View>

    {/* Right: Arabic Name (Prominent) */}
    <View style={styles.arabicContainer}>
      <Text style={styles.arabicText}>{item.NameArabic}</Text>
      <Ionicons
        name="play-circle"
        size={28}
        color="#065F46"
        style={{ marginTop: 5 }}
      />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 15,
    borderRadius: 18,
    // Soft Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  numberContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    // Halka sa border number box ko aur pyara banata hai
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  numberText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTitleText: {
    fontSize: 13,
    color: '#636E72',
  },
  arabicContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 22,
    color: '#065F46',
    fontWeight: '600',
    // Agar aapke paas custom Arabic font hai to yahan use karein
    fontFamily: Platform.OS === 'android' ? 'serif' : 'System',
  },
});

export default SurahCard;
