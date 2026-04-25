import { StyleSheet } from 'react-native';

export const ss = StyleSheet.create({
  container: {
    backgroundColor: '#F0F4F0',
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#065F46',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: '#333',
    fontSize: 15,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoSection: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'capitalize', // First letter capital karne k liye
  },
  itemSubTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  playBtn: {
    backgroundColor: '#00ADEF',
    padding: 8,
    borderRadius: 10,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 8,
  },
  footer: {
    padding: 20,
  },
  createBtn: {
    backgroundColor: '#065F46',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
  },
  createBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#008000',
    fontWeight: 'bold',
  },
});
