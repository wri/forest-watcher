// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-datepicker';
import i18n from 'i18next';
import moment from 'moment';

import styles from '../styles';
import dateStyles from './styles';

type Props = {
  question: Question,
  answer: Answer,
  onChange: Answer => void
};

function DateInput(props: Props) {
  const dateFormat = 'MMMM Do YYYY, h:mm';

  function handleChange(value) {
    if (value !== props.answer.value) {
      props.onChange({
        ...props.answer,
        value
      });
    }
  }

  function handleAndroidPress() {
    const initialDate = props.answer.value ? moment(props.answer.value, dateFormat).toDate() : new Date();

    DateTimePickerAndroid.open({
      value: initialDate,
      mode: 'date',
      onChange: (dateEvent, selectedDate) => {
        if (dateEvent.type !== 'set' || !selectedDate) return;

        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, selectedTime) => {
            if (timeEvent.type !== 'set' || !selectedTime) return;

            const nextDate = new Date(selectedDate);
            nextDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
            handleChange(moment(nextDate).format(dateFormat));
          }
        });
      }
    });
  }

  const isAndroid = Platform.OS === 'android';
  const displayText = props.answer.value || i18n.t('report.datePlaceholder');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      <View style={styles.inputContainer}>
        {isAndroid ? (
          <Pressable onPress={handleAndroidPress} style={[dateStyles.datePicker, dateStyles.dateInput]}>
            <Text style={props.answer.value ? dateStyles.dateText : dateStyles.placeholderText}>{displayText}</Text>
          </Pressable>
        ) : (
          <DatePicker
            style={dateStyles.datePicker}
            showIcon={false}
            date={props.answer.value}
            mode="datetime"
            format={dateFormat}
            placeholder={i18n.t('report.datePlaceholder')}
            cancelBtnText={i18n.t('commonText.cancel')}
            confirmBtnText={i18n.t('commonText.confirm')}
            onDateChange={handleChange}
            customStyles={{
              dateInput: dateStyles.dateInput,
              dateText: dateStyles.dateText
            }}
          />
        )}
      </View>
    </View>
  );
}

export default DateInput;
