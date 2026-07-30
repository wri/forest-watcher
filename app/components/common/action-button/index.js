import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, Platform, TouchableHighlight, TouchableNativeFeedback } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const nextIcon = require('assets/next.png');
const nextIconWhite = require('assets/next_white.png');

// Feature ready to use icons but empty to remove old and unused ones
const icons = {};

function ActionButton({
  compact = false,
  disabled = false,
  short = false,
  buttonStyle,
  light,
  dark,
  style,
  left,
  delete: deleteButton,
  secondary,
  error,
  icon,
  text,
  onPress,
  noIcon,
  main,
  monochrome,
  textStyle,
  transparent
}) {
  function onButtonPress() {
    if (!disabled) {
      onPress?.();
    }
  }
  const containerStyles = [
    styles.container,
    monochrome ? styles.light : '',
    left ? styles.left : '',
    dark ? styles.dark : '',
    light ? styles.light : '',
    disabled ? styles.disabled : '',
    secondary && disabled ? styles.secondaryDisabled : '',
    secondary && !disabled ? styles.secondary : '',
    error ? styles.error : '',
    deleteButton ? styles.error : '',
    transparent ? styles.transparent : '',
    style
  ];

  const btnStyles = [
    styles.button,
    compact ? styles.compact : '',
    light ? styles.buttonLight : '',
    short ? styles.short : '',
    !left && (disabled || deleteButton || noIcon) ? styles.buttonNoIcon : '',
    buttonStyle || ''
  ];

  const textStyles = [
    styles.buttonText,
    main ? styles.buttonTextMain : '',
    monochrome ? styles.buttonTextMonochrome : '',
    light ? styles.buttonTextLight : '',
    dark ? styles.buttonTextLight : '',
    left ? styles.buttonTextLeft : '',
    disabled ? styles.buttonTextDisabled : '',
    error ? styles.buttonTextError : '',
    deleteButton ? styles.buttonTextError : '',
    secondary && !disabled ? styles.buttonTextSecondary : '',
    secondary && disabled ? styles.buttonTextDisabled : '',
    transparent
      ? { color: deleteButton ? Theme.colors.carnation : light || dark ? '' : Theme.background.secondary }
      : '',
    compact ? styles.buttonTextCompact : '',
    textStyle || ''
  ];

  const arrowIconStyles = [Theme.icon, short ? styles.shortIcon : ''];

  let arrowIcon = nextIconWhite;
  let underlayColor = Platform.select({ android: Theme.background.white, ios: Theme.background.secondary });
  if (light || dark || secondary) {
    underlayColor = Theme.background.white;
    arrowIcon = nextIcon;
  }
  if (monochrome) {
    arrowIcon = nextIcon;
  }
  if (disabled) {
    underlayColor = Theme.colors.veryLightPinkTwo;
  }
  if (error || deleteButton) {
    underlayColor = Theme.colors.carnation;
  }

  const Touchable = Platform.select({
    android: TouchableNativeFeedback,
    ios: TouchableHighlight
  });

  return (
    <Touchable
      style={Platform.select({
        android: { borderRadius: 32 },
        ios: containerStyles
      })}
      onPress={onButtonPress}
      background={Platform.select({
        android: TouchableNativeFeedback.Ripple(underlayColor),
        ios: undefined
      })}
      activeOpacity={0.8}
      underlayColor={underlayColor}
      disabled={disabled}
    >
      <View
        style={Platform.select({
          android: [btnStyles, containerStyles],
          ios: btnStyles
        })}
      >
        {icons[icon] && (
          <View style={styles.iconContainer}>
            <Image style={Theme.icon} source={icons[icon]} />
          </View>
        )}
        {text && <Text style={textStyles}>{text}</Text>}
        {!(disabled || deleteButton || noIcon) && (
          <View style={styles.iconContainer}>
            <Image style={arrowIconStyles} source={arrowIcon} />
          </View>
        )}
      </View>
    </Touchable>
  );
}

ActionButton.propTypes = {
  buttonStyle: PropTypes.any,
  compact: PropTypes.bool,
  light: PropTypes.bool,
  dark: PropTypes.bool,
  style: PropTypes.any,
  left: PropTypes.bool,
  disabled: PropTypes.bool,
  delete: PropTypes.bool,
  secondary: PropTypes.bool,
  short: PropTypes.bool,
  error: PropTypes.bool,
  icon: PropTypes.string,
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  noIcon: PropTypes.bool,
  main: PropTypes.bool,
  monochrome: PropTypes.bool,
  textStyle: PropTypes.any,
  transparent: PropTypes.bool
};

export default ActionButton;
