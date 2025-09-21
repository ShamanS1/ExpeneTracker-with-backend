import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, SectionList, FlatList, Text, Dimensions, Platform, UIManager, StyleSheet } from 'react-native';
import { Card, FAB, TextInput, Chip, Button, IconButton, useTheme, DefaultTheme } from 'react-native-paper';
import ExpenseItem from '../components/ExpenseItem';
import { Expense } from   '../types';
import { categories } from '../constants/categories';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

const screenWidth = Dimensions.get('window').width;
const yearsRange = 5;

type Props = {
  expenses: Expense[];
  navigation: any;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (m: number) => void;
  setSelectedYear: (y: number) => void;
};

export default function ExpensesScreen({
  expenses, navigation, deleteExpense, updateExpense,
  selectedMonth, selectedYear, setSelectedMonth, setSelectedYear
}: Props) {
  const [showFilter, setShowFilter] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPayment, setFilterPayment] = useState<"Cash" | "Credit Card" | "Bank Account" | null>(null);
  const [filterText, setFilterText] = useState('');

  const flatListRef = useRef<FlatList>(null);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FAFAFA',
    primary: '#2196F3',
    secondary: '#616161',
    income: '#4CAF50',
    expense: '#F44336',
    accent: '#2196F3', // custom
  },
};


  // ✅ Multi-year monthData
  const monthData = useMemo(() => {
    const data: { month: number; year: number; name: string }[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    for (let y = currentYear - yearsRange; y <= currentYear + yearsRange; y++) {
      monthNames.forEach((name, month) => data.push({ month, year: y, name }));
    }
    return data;
  }, []);

  const initialIndex = useMemo(() => {
    const now = new Date();
    return yearsRange * 12 + now.getMonth();
  }, []);

  // Keep FlatList in sync
  useEffect(() => {
    const index = monthData.findIndex(m => m.month === selectedMonth && m.year === selectedYear);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  }, [selectedMonth, selectedYear, monthData]);

  const getMonthlyExpenses = (month: number, year: number) => {
    return expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .filter(e => !filterCategory || e.category === filterCategory)
      .filter(e => !filterPayment || e.paymentMethod === filterPayment)
      .filter(e => !filterText || e.description.toLowerCase().includes(filterText.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getGroupedExpenses = (monthlyExpenses: Expense[]) => {
    const groups: { title: string; data: Expense[] }[] = [];
    const map: { [key: string]: Expense[] } = {};

    monthlyExpenses.forEach(exp => {
      const dateStr = new Date(exp.date).toDateString();
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(exp);
    });

    Object.keys(map).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(key => groups.push({ title: key, data: map[key] }));

    return groups;
  };

  const renderMonthScreen = ({ item }: { item: { month: number; year: number; name: string } }) => {
    const monthlyExpenses = getMonthlyExpenses(item.month, item.year);
    const groupedExpenses = getGroupedExpenses(monthlyExpenses);

    return (
       <View style={{ width: screenWidth, flex: 1, paddingHorizontal: 8 }}>
    {groupedExpenses.length === 0 ? (
      <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
        No expenses for this month.
      </Text>
    ) : (
      <SectionList
        sections={groupedExpenses}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onDelete={() => deleteExpense(item.id)}
            onEdit={() => navigation.navigate('EditExpense', { expense: item })}
          />
        )}
      />
    )}
  </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Month Label */}
      <View style={[styles.monthLabelContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.monthLabel, { color: theme.colors.primary }]}>
          {monthData.find(m => m.month === selectedMonth && m.year === selectedYear)?.name} {selectedYear}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={monthData}
        renderItem={renderMonthScreen}
        keyExtractor={(item, index) => index.toString()}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          const item = monthData[newIndex];
          setSelectedMonth(item.month);
          setSelectedYear(item.year);
        }}
      />

      {/* Floating Buttons */}
      <FAB icon="plus" style={[styles.fabAdd, { backgroundColor: theme.colors.accent }]} onPress={() => navigation.navigate('AddExpense')} />
      <FAB icon="magnify" style={[styles.fabFilter, { backgroundColor: theme.colors.accent }]} onPress={() => setShowFilter(true)} />

      {/* Filter Overlay */}
      {showFilter && (
  <View style={styles.overlay}>
    <Card style={[styles.filterCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: theme.colors.primary }}>
            Filter Expenses
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowFilter(false)}
            iconColor={theme.colors.primary}
          />
        </View>

        <TextInput
          label="Search Description"
          value={filterText}
          onChangeText={setFilterText}
          style={{ marginBottom: 8 }}
          textColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.onSurfaceVariant}
        />

        <Text style={{ fontWeight: 'bold', marginBottom: 4, color: theme.colors.primary }}>
          Category
        </Text>
        <View style={styles.row}>
          {categories.map(cat => (
            <Chip
              key={cat}
              onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
              style={[
                styles.chip,
                { backgroundColor: filterCategory === cat ? theme.colors.primary : theme.colors.surface }
              ]}
              textStyle={{ color: filterCategory === cat ? '#fff' : theme.colors.onSurface }}
            >
              {cat}
            </Chip>
          ))}
        </View>

        <Text style={{ fontWeight: 'bold', marginBottom: 4, marginTop: 8, color: theme.colors.primary }}>
          Payment Method
        </Text>
        <View style={styles.row}>
          {["Cash","Credit Card","Bank Account"].map(pm => (
            <Chip
              key={pm}
              onPress={() => setFilterPayment(filterPayment === pm ? null : pm as any)}
              style={[
                styles.chip,
                { backgroundColor: filterPayment === pm ? theme.colors.primary : theme.colors.surface }
              ]}
              textStyle={{ color: filterPayment === pm ? '#fff' : theme.colors.onSurface }}
            >
              {pm}
            </Chip>
          ))}
        </View>

        <Button
          mode="contained"
          style={{ marginTop: 12, backgroundColor: theme.colors.primary }}
          onPress={() => setShowFilter(false)}
          textColor="#fff"
        >
          Apply Filter
        </Button>
      </Card.Content>
    </Card>
  </View>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  monthLabelContainer: { padding: 8, alignItems: 'center', elevation: 2 },
  monthLabel: { fontWeight: 'bold', fontSize: 18 },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: { margin: 4 },
  sectionHeader: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginTop: 12 },
  sectionHeaderText: { fontWeight: 'bold' },
  fabAdd: { position: 'absolute', right: 20, bottom: 30 },
  fabFilter: { position: 'absolute', left: 20, bottom: 30 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  filterCard: { width: '90%', borderRadius: 12, padding: 8 },
});
