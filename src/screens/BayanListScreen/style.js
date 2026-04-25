import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, // Match with Home
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    flex: 1,
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F6', // Soft grey like Quran screen
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#2D3436' },

  // Card styles for Bayan (Consistent with Surah Card)
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
    }),
  },
  leftSection: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  ayatText: {
    fontSize: 13,
    color: '#065F46', // Emerald Green
    fontWeight: '600',
    marginBottom: 5,
  },
  speakerRow: { flexDirection: 'row', alignItems: 'center' },
  speakerText: { fontSize: 13, color: '#636E72', marginLeft: 4 },

  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9', // Light green background
    justifyContent: 'center',
    alignItems: 'center',
  },
});
