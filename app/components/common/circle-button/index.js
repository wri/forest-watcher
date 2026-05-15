import React from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableHighlight } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

function ButtonCircle({ disabled = false, shouldFillContainer = false, ...props }) {
  function onButtonPress() {
    if (!disabled) {
      props.onPress?.();
    }
  }
  const btnStyles = [
    styles.container,
    props.light ? styles.light : '',
    props.gray ? styles.gray : '',
    props.red ? styles.red : '',
    props.style
  ];

  let underlayColor = Theme.background.secondary;
  if (props.light) {
    underlayColor = Theme.background.white;
  }
  if (props.red) {
    underlayColor = Theme.colors.carnation;
  }
  if (props.gray) {
    underlayColor = Theme.background.gray;
  }
  if (disabled) {
    underlayColor = Theme.colors.veryLightPinkTwo;
  }

  return (
    <TouchableHighlight
      onLayout={props.onLayout}
      style={[btnStyles, props.style]}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={underlayColor}
      disabled={disabled}
    >
      {props.icon && (
        <Image
          style={[shouldFillContainer ? Theme.largeIcon : Theme.icon, props.iconStyle ?? '']}
          source={props.icon}
        />
      )}
    </TouchableHighlight>
  );
}

ButtonCircle.propTypes = {
  shouldFillContainer: PropTypes.bool,
  red: PropTypes.bool,
  light: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  icon: PropTypes.number,
  iconStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  disabled: PropTypes.bool,
  onLayout: PropTypes.func,
  onPress: PropTypes.func.isRequired,
  gray: PropTypes.bool
};

export default ButtonCircle;
