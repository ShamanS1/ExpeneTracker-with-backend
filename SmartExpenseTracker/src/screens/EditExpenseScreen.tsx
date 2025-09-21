import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { TextInput, Text, Chip, Button, useTheme } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import { Expense } from '../types';
import { categories } from '../constants/categories';

type Props = {
  route: any;
  navigation: any;
  updateExpense: (expense: Expense) => void;
};

const paymentMethods: ("Cash" | "Credit Card" | "Bank Account")[] = [
  "Cash",
  "Credit Card",
  "Bank Account",
];

export default function EditExpenseScreen({ route, navigation, updateExpense }: Props) {
  const { expense } = route.params;
  const { colors } = useTheme();

  const initialDate = expense.date ? new Date(expense.date) : new Date();

  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Credit Card" | "Bank Account">(expense.paymentMethod);
  const [date, setDate] = useState(initialDate);

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  const handleUpdate = () => {
    if (!description || !amount || !category || !paymentMethod || !date) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const updatedExpense: Expense = {
      ...expense,
      description,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      date: date.toISOString(),
    };

    updateExpense(updatedExpense);
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
        {`Date: ${date.toISOString().split('T')[0]}`}
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
      />

      {/* Time Picker */}
      <Button
        mode="outlined"
        onPress={() => setOpenTimePicker(true)}
        style={[styles.btn, { borderColor: colors.primary }]}
        textColor={colors.primary}
      >
        {`Time: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
      </Button>

      <TimePickerModal
        visible={openTimePicker}
        onDismiss={() => setOpenTimePicker(false)}
        onConfirm={({ hours, minutes }) => {
          setOpenTimePicker(false);
          const updatedDate = new Date(date);
          updatedDate.setHours(hours);
          updatedDate.setMinutes(minutes);
          setDate(updatedDate);
        }}
        hours={date.getHours()}
        minutes={date.getMinutes()}
        label="Select time"
      />

      {/* Category Selection */}
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
            icon={undefined}
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
            icon={undefined}
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
        onPress={handleUpdate}
        style={{ marginTop: 16, backgroundColor: colors.primary }}
        textColor="#fff"
      >
        Update Expense
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
