import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SurahListScreen from '../screens/SurahListScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
import BayanListScreen from '../screens/BayanListScreen';

const stack = createNativeStackNavigator();
export const QuranStackNav = () => {
  return (
    <stack.Navigator>
      <stack.Screen name="SurahListScreen" component={SurahListScreen} />
      <stack.Screen
        name="AudioPlayerScreen"
        component={AudioPlayerScreen}
        initialParams={{ name: 'Quran audio player' }}
      />
    </stack.Navigator>
  );
};

export const BayanStackNav = () => {
  return (
    <stack.Navigator>
      <stack.Screen
        name="BayanListScreen"
        component={BayanListScreen}
        options={{ headerShown: false }}
      />
      <stack.Screen
        name="AudioPlayerScreen"
        component={AudioPlayerScreen}
        initialParams={{ name: 'bayan audio player' }}
        options={{ headerShown: false }}
      />
    </stack.Navigator>
  );
};
