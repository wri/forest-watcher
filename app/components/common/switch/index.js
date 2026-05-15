import React from 'react';
import { Platform, Switch } from 'react-native';
import PropTypes from 'prop-types';

import Theme from 'config/theme';

function CustomSwitch({ value, onValueChange, colorOn = Theme.colors.turtleGreen, colorOff = Theme.colors.veryLightPink }) {
  return (
    <Switch
      ios_backgroundColor={Theme.colors.veryLightPink}
      value={value}
      onValueChange={onValueChange}
      trackColor={Theme.colors.veryLightPink}
      thumbColor={Platform.OS === 'android' ? (value ? colorOn : colorOff) : null}
    />
  );
}

CustomSwitch.propTypes = {
  value: PropTypes.bool,
  onValueChange: PropTypes.func.isRequired,
  colorOn: PropTypes.string,
  colorOff: PropTypes.string
};

export default CustomSwitch;
