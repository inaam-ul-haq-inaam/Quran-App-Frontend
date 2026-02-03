import React from 'react';
import { View } from 'react-native'; // 👈 1. View import karna zaroori hai
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import {
  QuranStackNav,
  BayanStackNav,
  HomeStackNav,
} from '../navigation/StackNav';
import { CreateChain } from '../navigation/StackNav';
import SettingScreen from '../screens/SettingScreen';
import { HideNav } from '../components/HideNav';

// 👇 2. Aapki Nayi Files Import ki hain
import VoiceMicButton from '../components/MicrophoneButton';
import VM from '../components/VoiceInputWebView';

const TabNav = () => {
  const tab = createBottomTabNavigator();

  return (
    <NavigationContainer>
      {/* 👇 3. Pure Navigator ko View mein lapet diya (Container) */}
      <View style={{ flex: 1 }}>
        <tab.Navigator
          screenOptions={({ route }) => ({
            tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
            tabBarActiveTintColor: '#008000',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Quran') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Bayan') {
                iconName = focused ? 'mic' : 'mic-outline';
              } else if (route.name === 'Chain') {
                iconName = focused ? 'link' : 'link-outline';
              } else if (route.name === 'Setting') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <tab.Screen
            name="Home"
            component={HomeStackNav}
            options={({ route }) => ({
              tabBarStyle: {
                display: HideNav(route, ['VoiceToText']),
              },
            })}
          />

          <tab.Screen
            name="Quran"
            component={QuranStackNav}
            options={({ route }) => ({
              tabBarStyle: {
                display: HideNav(route, ['AudioPlayerScreen']),
              },
            })}
          />

          <tab.Screen
            name="Bayan"
            component={BayanStackNav}
            options={({ route }) => ({
              tabBarStyle: {
                display: HideNav(route, ['AudioPlayerScreen']),
              },
            })}
          />

          <tab.Screen name="Chain" component={CreateChain} />
          <tab.Screen name="Setting" component={SettingScreen} />
        </tab.Navigator>

        <VoiceMicButton />
        <VM />
      </View>
    </NavigationContainer>
  );
};

export default TabNav;
