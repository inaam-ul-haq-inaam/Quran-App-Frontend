import { StyleSheet } from 'react-native';

export const ss = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  iconCircle: {
    borderRadius: 20,
    borderWidth: 1,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeView: {
    borderRadius: 10,
    padding: 10,
    margin: 15,
    backgroundColor: 'rgb(20, 148, 40)',
  },
  timeViewText: {
    color: 'white',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    margin: 15,
  },
  sectionTitleText: {
    fontWeight: 'bold',
    paddingLeft: 10,
  },
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
