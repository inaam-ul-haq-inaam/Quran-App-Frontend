import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { styles } from './style';
import { useSurahController } from './controller';
import SurahCard from './components/SurahCard';

const SurahListScreen = ({ navigation }) => {
  const { loading, surahlist, openPlayer } = useSurahController(navigation);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Loading .....</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={surahlist}
        renderItem={({ item }) => (
          <SurahCard item={item} onPress={() => openPlayer(item)} />
        )}
        keyExtractor={item => item.surahNumber.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default SurahListScreen;
