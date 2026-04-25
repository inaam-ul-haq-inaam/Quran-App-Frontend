import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BayanCard = ({ item, onPressPlay }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPressPlay}
      activeOpacity={0.8}
    >
      {/* Left Section: Info */}
      <View style={styles.leftSection}>
        <Text style={styles.title} numberOfLines={1}>
          {item.Title}
        </Text>

        <Text style={styles.ayatText}>
          {item.SurahName} • Ayats {item.StartAyatID}-{item.EndAyatID}
        </Text>

        <View style={styles.speakerRow}>
          <Ionicons name="person-circle-outline" size={16} color="#065F46" />
          <Text style={styles.speakerText}>{item.ScholorName}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#9CA3AF" />
          <Text style={styles.durationText}>{item.Duration}</Text>
        </View>
      </View>

      {/* Right Section: Actions */}
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.favButton}>
          <Ionicons name="heart-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.playButtonCircle}>
          <Ionicons
            name="play"
            size={20}
            color="white"
            style={{ marginLeft: 2 }} // Play icon ko center karne ke liye
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  leftSection: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  ayatText: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '600',
    marginBottom: 6,
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  speakerText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    minHeight: 80,
  },
  favButton: {
    padding: 5,
  },
  playButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    // Button shadow
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default BayanCard;
