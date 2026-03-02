export const useHomeController = navigation => {
  const nextScreen = page => {
    if (page === 'Quran') {
      navigation.navigate('Quran');
    } else if (page === 'Bayan') {
      navigation.navigate('Bayan');
    } else {
      navigation.navigate('Chain');
    }
  };

  const openVoiceControl = () => {
    navigation.navigate('VoiceToText');
  };

  return {
    nextScreen,
    openVoiceControl,
  };
};
