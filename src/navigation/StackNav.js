import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SurahListScreen from '../screens/SurahListScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';
import BayanListScreen from '../screens/BayanListScreen';

import HomeScreen from '../screens/HomeScreen';
import VoiceToText from '../screens/VoiceToText';

const stack = createNativeStackNavigator();

export const HomeStackNav = () => {
  return (
    <stack.Navigator>
      {/* Pehli screen Home hogi */}
      <stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      {/* Dusri screen Voice AI hogi */}
      <stack.Screen
        name="VoiceToText"
        component={VoiceToText}
        options={{ title: 'Voice Search' }} // Iska Header show hoga ta ke Back button aye
      />
    </stack.Navigator>
  );
};
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
