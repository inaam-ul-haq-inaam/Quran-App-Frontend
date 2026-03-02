import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: { color: '#008000', fontWeight: 'bold' },
  textContainer: { flex: 1 },
  titleText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  subTitleText: { fontSize: 14, color: 'gray' },
});
