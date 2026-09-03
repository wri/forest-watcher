// @flow

import React, { Component } from 'react';
import Hyperlink from 'react-native-hyperlink';
import { View, Text } from 'react-native';
import { trackScreenView } from 'helpers/analytics';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';

class ContactUs extends Component<{}> {
  componentDidMount() {
    trackScreenView('ContactUs');
  }

  render() {
    return (
      <View style={styles.container}>
        <Hyperlink
          linkDefault
          linkStyle={Theme.link}
          linkText={url =>
            url.includes('zendesk.com') || url === 'mailto:forestwatcher@wri.org'
              ? i18n.t('contactUs.linkText')
              : url
          }
        >
          <Text style={styles.contactUsText} selectable>
            {i18n.t('contactUs.description')}
          </Text>
        </Hyperlink>
      </View>
    );
  }
}

ContactUs.propTypes = {};

export default ContactUs;
