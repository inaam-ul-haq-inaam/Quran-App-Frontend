import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ss } from '../style';

const MainCard = ({ title, onPress, bgColor }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[ss.MainSectionView, bgColor && { backgroundColor: bgColor }]}>
      <Text style={ss.mainSectionText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

export default MainCard;
