import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeScreen = ({ navigation }) => {
  const nextScreen = page => {
    page == 'Quran'
      ? navigation.navigate('Quran')
      : page == 'Bayan'
      ? navigation.navigate('Bayan')
      : navigation.navigate('Manazil');
  };
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          margin: 20,
        }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 25 }}>
          Aslam o Alikum!
        </Text>
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            height: 30,
            width: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="person" size={20} />
        </View>
      </View>

      <View style={ss.timeView}>
        <Text style={ss.timeViewText}>Current Time</Text>
        <Text style={[ss.timeViewText, { fontWeight: 'bold', fontSize: 30 }]}>
          7:57 PM
        </Text>
        <Text style={[ss.timeViewText, { marginTop: 10 }]}>Next Prayer:</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Ionicons name="time" size={20} style={{ marginTop: 5 }} />
          <Text
            style={[
              ss.timeViewText,
              { fontWeight: 'bold', marginTop: 3, marginRight: '45%' },
            ]}
          >
            Maghrib
          </Text>
          <Text style={[ss.timeViewText, { fontWeight: 'bold', fontSize: 20 }]}>
            6:15 PM
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', margin: 15 }}>
        <Ionicons name="book" size={20} />
        <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>
          Main Sections
        </Text>
      </View>
      <View style={ss.MainSectionUperView}>
        <TouchableOpacity onPress={() => nextScreen('Quran')}>
          <View
            style={[
              ss.MainSectionView,
              { backgroundColor: 'rgb(57, 212, 46)' },
            ]}
          >
            <Text style={ss.mainSectionText}>Quran</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nextScreen('Bayan')}>
          <View style={ss.MainSectionView}>
            <Text style={ss.mainSectionText}>Bayan</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nextScreen('Manazil')}>
          <View
            style={[
              ss.MainSectionView,
              { backgroundColor: 'rgb(61, 89, 201)' },
            ]}
          >
            <Text style={ss.mainSectionText}>Manazil</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', margin: 15 }}>
        <Ionicons name="star" size={20} />
        <Text style={{ fontWeight: 'bold', paddingLeft: 10 }}>
          Quick Actions
        </Text>
      </View>

      <View>
        <View style={ss.bookmarkViews}>
          <Ionicons name="bookmark" size={20} />
          <Text style={ss.bookmarkTexts}>Quran BookMark</Text>
        </View>
        <View style={ss.bookmarkViews}>
          <Ionicons name="bookmark" size={20} />
          <Text style={ss.bookmarkTexts}> Bayan BookMark</Text>
        </View>
        <View style={ss.bookmarkViews}>
          <Ionicons name="bookmark" size={20} />
          <Text style={ss.bookmarkTexts}>Manazil BookMark</Text>
        </View>
      </View>
    </View>
  );
};
const ss = StyleSheet.create({
  MainSectionUperView: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  MainSectionView: {
    borderWidth: 1,
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'rgb(215, 184, 30)',
  },
  mainSectionText: {
    color: 'white',
  },
  timeView: {
    borderWidth: 0,
    borderRadius: 10,
    padding: 10,
    margin: 15,
    backgroundColor: 'rgb(20, 148, 40)',
  },
  timeViewText: {
    color: 'white',
  },
  bookmarkViews: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 13,
    margin: 10,
  },
  bookmarkTexts: {
    paddingLeft: 15,
  },
});
export default HomeScreen;
