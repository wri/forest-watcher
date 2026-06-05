import React, { Component } from 'react';
import { StatusBar, View, Platform } from 'react-native';
import Theme from 'config/theme';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

export default class IOStranslucentStatusBar extends Component {
  render() {
    return (
      <View
        style={{
          width: '100%',
          height: STATUS_BAR_HEIGHT,
          backgroundColor: Theme.colors.black
        }}
      />
    );
  }
}
