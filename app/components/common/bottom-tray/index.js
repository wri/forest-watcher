// @flow

import React, { Component, type ElementConfig } from 'react';
import { View } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Theme from 'config/theme';

import styles from './styles';

type Props = {
  ...ElementConfig<typeof View>,
  requiresSafeAreaView: boolean,
  showProgressBar?: boolean
};

function BottomTray(props: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = props.requiresSafeAreaView ? insets.bottom : 0;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {!!props.showProgressBar && (
        <ProgressBar
          indeterminate
          width={Theme.screen.width}
          height={4}
          color={Theme.colors.turtleGreen}
          borderRadius={0}
          borderColor="transparent"
          style={{ marginTop: -2 }}
        />
      )}
      <View style={styles.innerContainer}>
        <View style={props.style}>{props.children}</View>
      </View>
    </View>
  );
}

export default BottomTray;
