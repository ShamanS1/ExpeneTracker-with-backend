import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { TextInput, Text, Chip, Button, useTheme } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { categories } from '../constants/categories';
import { Expense } from '../types';

type Props = {
  navigation: any;
  addExpense: (expense: Expense) => void;
};

const paymentMethods: ("Cash" | "Credit Card" | "Bank Account")[] = [
  "Cash",
  "Credit Card",
  "Bank Account",
];

export default function AddExpenseScreen({ navigation, addExpense }: Props) {
  const { colors } = useTheme();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Credit Card" | "Bank Account">("Cash");

  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const handleAdd = () => {
    if (!description || !amount || !category || !paymentMethod || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newExpense: Expense = {
      id: Math.random().toString(),
      description,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      date: date.toISOString(),
    };

    addExpense(newExpense);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        label="Description"
        mode="outlined"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        textColor={colors.onSurface}
        placeholderTextColor={colors.onSurfaceVariant}
      />

      <TextInput
        label="Amount"
        mode="outlined"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
        textColor={colors.onSurface}
        placeholderTextColor={colors.onSurfaceVariant}
      />

      {/* Date Picker */}
      <Button
        mode="outlined"
        onPress={() => setOpenDatePicker(true)}
        style={[styles.btn, { borderColor: colors.primary }]}
        textColor={colors.primary}
      >
        {`Date: ${date.toLocaleDateString()}`}
      </Button>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={openDatePicker}
        date={date}
        onDismiss={() => setOpenDatePicker(false)}
        onConfirm={(params) => {
          setOpenDatePicker(false);
          if (params.date) setDate(params.date);
        }}
        saveLabel="Save"
        label="Select date"
      />

      {/* Time Picker */}
      <Button
        mode="outlined"
        onPress={() => setOpenTimePicker(true)}
        style={[styles.btn, { borderColor: colors.primary }]}
        textColor={colors.primary}
      >
        {`Time: ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}
      </Button>

      <TimePickerModal
        visible={openTimePicker}
        onDismiss={() => setOpenTimePicker(false)}
        onConfirm={(params) => {
          setOpenTimePicker(false);
          if (params.hours !== undefined && params.minutes !== undefined) {
            const newDate = new Date(date);
            newDate.setHours(params.hours);
            newDate.setMinutes(params.minutes);
            setDate(newDate);
          }
        }}
        hours={date.getHours()}
        minutes={date.getMinutes()}
        label="Select time"
        cancelLabel="Cancel"
        confirmLabel="Save"
      />

      {/* Category */}
      <Text variant="titleMedium" style={[styles.label, { color: colors.primary }]}>
        Select Category
      </Text>
      <View style={styles.row}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            onPress={() => setCategory(cat)}
            style={[
              styles.chip,
              { backgroundColor: category === cat ? colors.primary : colors.surface },
            ]}
            textStyle={{ color: category === cat ? '#fff' : colors.onSurface }}
          >
            {cat}
          </Chip>
        ))}
      </View>

      {/* Payment Method */}
      <Text variant="titleMedium" style={[styles.label, { color: colors.primary }]}>
        Select Payment Method
      </Text>
      <View style={styles.row}>
        {paymentMethods.map((method) => (
          <Chip
            key={method}
            onPress={() => setPaymentMethod(method)}
            style={[
              styles.chip,
              { backgroundColor: paymentMethod === method ? colors.primary : colors.surface },
            ]}
            textStyle={{ color: paymentMethod === method ? '#fff' : colors.onSurface }}
          >
            {method}
          </Chip>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleAdd}
        style={{ marginTop: 16, backgroundColor: colors.primary }}
        textColor="#fff"
      >
        Add Expense
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { marginBottom: 12 },
  label: { marginTop: 12, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { margin: 4 },
  btn: { marginBottom: 8 },
});
