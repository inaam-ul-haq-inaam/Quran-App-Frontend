import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light grey background
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F2F6',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2D3436',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  // SurahCard Styles (If using inside the same file or reference)
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    // Soft Shadow
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
  numberContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#E8F5E9', // Light Green
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textContainer: { flex: 1 },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
  },
  subTitleText: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 2,
  },
  arabicText: {
    fontSize: 20,
    color: '#065F46',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'serif', // Agar custom font hai to wo use karein
  },
});
