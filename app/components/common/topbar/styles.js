import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  title: {
    ...Theme.text,
    fontSize: 24,
    marginHorizontal: 24
  },
  bannerGreen: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.bannerGreen,
    paddingVertical: 8
  },
  bannerGrey: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.greyishBrown,
    paddingVertical: 8
  },
  bannerLabel: {
    ...Theme.text,
    color: 'white',
    fontSize: 12,
    marginLeft: 6
  },
  offlineTitle: {
    ...Theme.text,
    fontSize: 17,
    marginTop: 15,
    lineHeight: 22
  },
  offlineSubTitle: {
    ...Theme.text,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18
  }
});
