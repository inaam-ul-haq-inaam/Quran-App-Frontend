import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import { QuranStackNav, BayanStackNav } from '../navigation/StackNav';
import ManazilScreen from '../screens/ManazilScreen';
import SettingScreen from '../screens/SettingScreen';
import { HideNav } from '../components/HideNav';

const TabNav = () => {
  const tab = createBottomTabNavigator();

  return (
    <NavigationContainer>
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
            } else if (route.name === 'Manazil') {
              iconName = focused ? 'link' : 'link-outline';
            } else if (route.name === 'Setting') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <tab.Screen name="Home" component={HomeScreen} />

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

        <tab.Screen name="Manazil" component={ManazilScreen} />
        <tab.Screen name="Setting" component={SettingScreen} />
      </tab.Navigator>
    </NavigationContainer>
  );
};

export default TabNav;
