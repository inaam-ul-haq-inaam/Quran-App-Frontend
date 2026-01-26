/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import TrackPlayer from 'react-native-track-player'; // 1. Import kiya

AppRegistry.registerComponent(appName, () => App);
// 2. Yeh line add karein (Service Register karne k liye)
TrackPlayer.registerPlaybackService(() => require('./service'));
