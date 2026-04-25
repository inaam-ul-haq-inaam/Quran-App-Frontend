import { StyleSheet, Platform } from 'react-native';

export const ss = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light grey background for better contrast
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
  },
  subtitleText: {
    fontSize: 14,
    color: '#636E72',
    marginTop: -2,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconCircle: {
    borderRadius: 12,
    backgroundColor: 'white',
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    // Shadow for iOS/Android
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  timeView: {
    borderRadius: 20,
    padding: 20,
    margin: 20,
    backgroundColor: '#065F46', // Deep Emerald Green
    // Premium Look Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#065F46',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  timeViewText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  currentTimeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 34,
    marginVertical: 5,
  },
  nextPrayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitleText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#2D3436',
    marginLeft: 8,
  },
  MainSectionUperView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
  },
  // Bookmark Styles
  bookmarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F2F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 2 },
    }),
  },
  bookmarkIconBox: {
    backgroundColor: '#E6F4EA',
    padding: 10,
    borderRadius: 10,
  },
  bookmarkTexts: {
    flex: 1,
    paddingLeft: 15,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
});
