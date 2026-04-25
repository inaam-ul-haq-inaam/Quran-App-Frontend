import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import TabNav from './src/navigation/TabNav';

const App = () => {
  useEffect(() => {
    const init = async () => {
      // 💡 Agar aapne koi API call ya data loading karni hai toh yahan kar sakte hain
      console.log('App is initializing...');
    };

    init().finally(async () => {
      // 🎯 Splash screen ko smoothly hide karein
      await BootSplash.hide({ fade: true });
      console.log('BootSplash hidden successfully! 🚀');
    });
  }, []);

  return (
    <>
      {/* StatusBar ko background color ke sath match karne ke liye */}
      <StatusBar backgroundColor="#1F4037" barStyle="light-content" />
      <TabNav />
    </>
  );
};

export default App;
