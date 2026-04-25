import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MainCard = ({ title, onPress, bgColor, icon, textColor }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8} // Click karne par halka sa feedback milega
    style={styles.cardWrapper}
  >
    <View
      style={[styles.cardContainer, { backgroundColor: bgColor || '#FFFFFF' }]}
    >
      {/* Icon Circle - Background se thora dark ya light shade */}
      <View style={styles.iconCircle}>
        <Ionicons
          name={icon || 'apps-outline'}
          size={28}
          color={textColor || '#2D3436'}
        />
      </View>

      <Text style={[styles.cardText, { color: textColor || '#2D3436' }]}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 8,
  },
  cardContainer: {
    width: 100, // Aap apni screen width ke hisab se adjust kar sakte hain
    height: 110,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    // Soft Shadow for Premium Feel
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconCircle: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent effect
  },
  cardText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default MainCard;
