import {StyleSheet, Dimensions} from 'react-native';

let ScreenHeight = Dimensions.get('window').height;
let ScreenWidth = Dimensions.get('window').width;

const raw_styles = require('./styles.json');
const styles = StyleSheet.create(
  JSON.parse(
    JSON.stringify(raw_styles)
      .replace(/"ScreenWidth"/gm, ScreenWidth)
      .replace(/"ScreenHeight"/gm, ScreenHeight),
  ),
);

export default styles;
