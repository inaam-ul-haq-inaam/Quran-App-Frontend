import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ss } from './style';
import MainCard from './components/MainCard';
import { useHomeController } from './controller';

const HomeScreen = ({ navigation }) => {
  const { nextScreen, openVoiceControl } = useHomeController(navigation);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Clock Logic: Har second time update hoga
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Formatting Time Helper (e.g., 07:57 PM)
  const formatTime = date => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 ko 12 bana dega
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  // 3. Simple Prayer Logic (Hardcoded Timings for Logic)
  const getNextPrayer = () => {
    const schedule = [
      { name: 'Fajr', time: '04:30' },
      { name: 'Dhuhr', time: '12:15' },
      { name: 'Asr', time: '16:45' },
      { name: 'Maghrib', time: '18:40' },
      { name: 'Isha', time: '20:15' },
    ];

    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (let i = 0; i < schedule.length; i++) {
      const [h, m] = schedule[i].time.split(':');
      const prayerMinutes = parseInt(h) * 60 + parseInt(m);
      if (prayerMinutes > now) {
        // Time format for display
        let displayHour = parseInt(h);
        const ampm = displayHour >= 12 ? 'PM' : 'AM';
        displayHour = displayHour % 12 || 12;
        return { name: schedule[i].name, time: `${displayHour}:${m} ${ampm}` };
      }
    }
    return { name: 'Fajr', time: '04:30 AM' }; // Agle din ki Fajr
  };

  const nextPrayer = getNextPrayer();

  const quickActions = [
    {
      title: 'Bookmark Surah',
      icon: 'book-outline',
      screen: 'BookmarkListScreen',
    },
    { title: 'Bookmark Bayan', icon: 'mic-outline', screen: 'Bayan' },
    { title: 'Bookmark Chain', icon: 'link-outline', screen: 'Chain' },
  ];

  return (
    <View style={ss.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={ss.header}>
          <View>
            <Text style={ss.greetingText}>Aslam o Alikum!</Text>
            <Text style={ss.subtitleText}>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <View style={ss.iconContainer}>
            <TouchableOpacity style={ss.iconCircle} onPress={openVoiceControl}>
              <Ionicons name="mic-outline" size={22} color="#065F46" />
            </TouchableOpacity>
            <TouchableOpacity style={ss.iconCircle}>
              <Ionicons name="person-outline" size={22} color="#065F46" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayer Time Card */}
        <View style={ss.timeView}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                Current Time
              </Text>
              <Text style={ss.currentTimeText}>{formatTime(currentTime)}</Text>
            </View>
            <Ionicons name="sunny-outline" size={40} color="#FFD700" />
          </View>

          <View style={ss.nextPrayerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={18} color="white" />
              <Text
                style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}
              >
                Next: {nextPrayer.name}
              </Text>
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {nextPrayer.time}
            </Text>
          </View>
        </View>

        {/* Main Sections */}
        <View style={ss.sectionHeader}>
          <Ionicons name="grid-outline" size={20} color="#065F46" />
          <Text style={ss.sectionTitleText}>Main Sections</Text>
        </View>

        <View style={ss.MainSectionUperView}>
          <MainCard
            title="Quran"
            icon="book-outline"
            bgColor="#E8F5E9"
            textColor="#2E7D32"
            onPress={() => nextScreen('Quran')}
          />
          <MainCard
            title="Bayan"
            icon="headset-outline"
            bgColor="#FFF8E1"
            textColor="#F9A825"
            onPress={() => nextScreen('Bayan')}
          />
          <MainCard
            title="Chain"
            icon="link-outline"
            bgColor="#E3F2FD"
            textColor="#1565C0"
            onPress={() => nextScreen('Chain')}
          />
        </View>

        {/* Quick Actions (Bookmarks) */}
        <View style={[ss.sectionHeader, { marginTop: 25 }]}>
          <Ionicons name="bookmark-outline" size={20} color="#065F46" />
          <Text style={ss.sectionTitleText}>Quick Access</Text>
        </View>

        <View style={{ marginBottom: 30 }}>
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={ss.bookmarkCard}
              onPress={() => nextScreen(item.screen)}
            >
              <View style={ss.bookmarkIconBox}>
                <Ionicons name={item.icon} size={22} color="#065F46" />
              </View>
              <View style={ss.bookmarkTexts}>
                <Text style={ss.bookmarkTitle}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: '#95A5A6' }}>
                  View saved items
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color="#BDC3C7"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
