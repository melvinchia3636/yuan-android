import {StyleSheet, Dimensions} from 'react-native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

let ScreenHeight = Dimensions.get('window').height;
let ScreenWidth = Dimensions.get('window').width;

const raw_styles = Object.entries(require('./styles.json'));

for (let i of raw_styles) {
  i[1].width = wp(i[1].width);
  if (Object.keys(i[1]).includes('fontSize')) {
    i[1].fontSize = wp(i[1].fontSize);
  }
  switch (i[1].height) {
    case 'sameAsWidth':
      i[1].height = i[1].width;
      break;
    default:
      i[1].height = hp(i[1].height);
  }
}

const styles = StyleSheet.create(
  JSON.parse(
    JSON.stringify(Object.fromEntries(raw_styles))
      .replace(/"ScreenWidth"/gm, ScreenWidth)
      .replace(/"ScreenHeight"/gm, ScreenHeight),
  ),
);

export default styles;
