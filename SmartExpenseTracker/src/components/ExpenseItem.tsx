import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Expense } from '../../App';

const CATEGORY_COLORS: { [key: string]: string } = {
  Food: '#f39c12',
  Transport: '#3498db',
  Shopping: '#9b59b6',
  Bills: '#e74c3c',
  Others: '#2ecc71',
};

type Props = {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ExpenseItem({ expense, onEdit, onDelete }: Props) {
  const theme = useTheme();
  const categoryColor = CATEGORY_COLORS[expense.category] || theme.colors.secondary;
  const dateObj = new Date(expense.date);
  const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content style={styles.container}>
        {/* Left: Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{expense.category}</Text>
        </View>

        {/* Middle: Expense Info */}
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={[styles.description, { color: theme.colors.onSurface }]}>{expense.description}</Text>
            <Text
              style={[
                styles.amount,
                { color: expense.amount >= 0 ? '#4CAF50' : '#F44336' },
              ]}
            >
              ₹ {expense.amount.toFixed(2)}
            </Text>
          </View>
          <Text style={[styles.payment, { color: theme.colors.secondary }]}>
            Payment: {expense.paymentMethod}
          </Text>
          {expense.note ? (
            <Text style={[styles.note, { color: theme.colors.secondary }]}>Note: {expense.note}</Text>
          ) : null}
          <Text style={[styles.dateTime, { color: theme.colors.secondary }]}>
            {formattedDate} • {formattedTime}
          </Text>
        </View>

        {/* Right: Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <MaterialIcons name="edit" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <MaterialIcons name="delete" size={22} color="#EF5350" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 6, borderRadius: 12, elevation: 2 },
  container: { flexDirection: 'row', alignItems: 'flex-start' },

  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  categoryText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  description: { fontWeight: 'bold', fontSize: 16, flexShrink: 1 },
  amount: { fontWeight: 'bold', fontSize: 16 },

  payment: { fontSize: 13, marginTop: 2 },
  note: { fontSize: 13, marginTop: 2 },
  dateTime: { fontSize: 12, marginTop: 4 },

  actions: { marginLeft: 8, justifyContent: 'flex-start' },
  iconButton: { marginBottom: 6 },
});
