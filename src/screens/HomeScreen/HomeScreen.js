import React from 'react';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ss } from './style';
import { useHomeController } from './controller';

import MainCard from './components/MainCard';
import BookmarkRow from './components/BookmarkRow';

const HomeScreen = ({ navigation }) => {
  const { nextScreen, openVoiceControl } = useHomeController(navigation);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={ss.header}>
        <Text style={{ fontWeight: 'bold', fontSize: 25 }}>
          Aslam o Alikum!
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[ss.iconCircle, { marginRight: 10 }]}
            onPress={openVoiceControl}
          >
            <Ionicons name="mic" size={20} />
          </TouchableOpacity>
          <View style={ss.iconCircle}>
            <Ionicons name="person" size={20} />
          </View>
        </View>
      </View>

      {/* Prayer Time Card */}
      <View style={ss.timeView}>
        <Text style={ss.timeViewText}>Current Time</Text>
        <Text style={[ss.timeViewText, { fontWeight: 'bold', fontSize: 30 }]}>
          7:57 PM
        </Text>
        <Text style={[ss.timeViewText, { marginTop: 10 }]}>Next Prayer:</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="time" size={20} color="white" />
            <Text
              style={[ss.timeViewText, { fontWeight: 'bold', marginLeft: 10 }]}
            >
              Maghrib
            </Text>
          </View>
          <Text style={[ss.timeViewText, { fontWeight: 'bold', fontSize: 20 }]}>
            6:15 PM
          </Text>
        </View>
      </View>

      {/* Main Sections */}
      <View style={ss.sectionTitleRow}>
        <Ionicons name="book" size={20} />
        <Text style={ss.sectionTitleText}>Main Sections</Text>
      </View>

      <View style={ss.MainSectionUperView}>
        <MainCard
          title="Quran"
          onPress={() => nextScreen('Quran')}
          bgColor="rgb(57, 212, 46)"
        />
        <MainCard title="Bayan" onPress={() => nextScreen('Bayan')} />
        <MainCard
          title="Chain"
          onPress={() => nextScreen('Chain')}
          bgColor="rgb(61, 89, 201)"
        />
      </View>

      {/* Quick Actions / Bookmarks */}
      <View style={ss.sectionTitleRow}>
        <Ionicons name="star" size={20} />
        <Text style={ss.sectionTitleText}>Quick Actions</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        {['Quran', 'Bayan', 'Chain'].map((item, index) => (
          <BookmarkRow key={index} title={item} />
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
