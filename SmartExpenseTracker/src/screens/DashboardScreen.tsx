import React, { useMemo, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Dimensions, Platform, UIManager } from 'react-native';
import { Expense } from '../../App';
import { PieChart } from 'react-native-chart-kit';
import { Card, Title, Paragraph, Divider, useTheme } from 'react-native-paper';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental?.(true);

const screenWidth = Dimensions.get('window').width;
const COLORS = ['#f39c12','#F44336','#4CAF50','#2196F3','#9b59b6','#1abc9c','#34495e','#e67e22','#16a085','#c0392b'];

type MonthItem = { month: number; year: number; name: string };

type Props = {
  expenses: Expense[];
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (m: number) => void;
  setSelectedYear: (y: number) => void;
};

export default function DashboardScreen({ expenses, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }: Props) {
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const yearsRange = 5;

  const monthData: MonthItem[] = useMemo(() => {
    const data: MonthItem[] = [];
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

  useEffect(() => {
    const index = monthData.findIndex(m => m.month === selectedMonth && m.year === selectedYear);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  }, [selectedMonth, selectedYear, monthData]);

  const getMonthlyExpenses = (month: number, year: number) => {
    return expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const renderMonthScreen = ({ item }: { item: MonthItem }) => {
    const monthlyExpenses = getMonthlyExpenses(item.month, item.year);
    const totalSpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryTotals: { [key: string]: number } = {};
    monthlyExpenses.forEach(e => categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount);

    let topCategory = '';
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategory = cat;
        topCategoryAmount = amt;
      }
    });

    const chartData = Object.entries(categoryTotals).map(([cat, amt], index) => ({
      name: cat,
      amount: amt,
      color: COLORS[index % COLORS.length],
      legendFontColor: theme.dark ? '#E0E0E0' : '#616161',
      legendFontSize: 12,
    }));

    const sideLegend = Object.entries(categoryTotals).map(([cat], index) => ({
      name: cat,
      color: COLORS[index % COLORS.length],
    }));

    const slices = Object.entries(categoryTotals).map(([cat, amt], index) => ({
      name: cat,
      amount: amt,
      color: COLORS[index % COLORS.length],
      percentage: totalSpend > 0 ? (amt / totalSpend) * 100 : 0,
    }));

    return (
      <View style={{ width: screenWidth, padding: 12 }}>
        {/* Month-Year Label */}
        <View style={[styles.monthLabelContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.monthLabel, { color: theme.colors.primary }]}>{monthNames[item.month]} {item.year}</Text>
        </View>

        {/* Total Spend Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.primary }}>Total Spend</Title>
            <Paragraph style={{ fontSize: 28, fontWeight: 'bold', color: theme.dark ? '#81C784' : '#4CAF50' }}>
              ₹ {totalSpend.toFixed(2)}
            </Paragraph>
            <Text style={{ color: theme.colors.secondary }}>{monthlyExpenses.length} expenses this month</Text>
          </Card.Content>
        </Card>

        {/* Top Category Card */}
        {topCategory ? (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.primary }}>Top Category</Title>
              <Paragraph style={{ fontSize: 20, color: theme.dark ? '#EF5350' : '#F44336' }}>{topCategory}</Paragraph>
              <Text style={{ color: theme.colors.secondary }}>₹ {topCategoryAmount.toFixed(2)}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 2 }}>
                <PieChart
                  data={chartData}
                  width={Dimensions.get('window').width * 0.55}
                  height={220}
                  chartConfig={{
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    color: (opacity = 1) => theme.dark ? `rgba(224,224,224,${opacity})` : `rgba(33,33,33,${opacity})`,
                    decimalPlaces: 0,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="45"
                  hasLegend={false}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                {sideLegend.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 3, marginRight: 6, backgroundColor: item.color }} />
                    <Text style={{ color: theme.colors.secondary }}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Spending by Category */}
        {slices.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface, marginBottom: 24 }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.primary }}>Spending by Category</Title>
              <Divider style={{ marginVertical: 8, backgroundColor: theme.colors.onSurfaceVariant }} />
              {slices.map((slice, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 50, height: 28, borderRadius: 4,
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: slice.color, marginRight: 10
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{slice.percentage.toFixed(0)}%</Text>
                  </View>
                  <Text style={{ flex: 1, color: theme.colors.secondary }}>{slice.name}</Text>
                  <Text style={{ color: theme.colors.secondary }}>₹ {slice.amount.toFixed(2)}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  return (
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
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 8, borderRadius: 12, elevation: 2 },
  monthLabelContainer: { padding: 8, alignItems: 'center', borderRadius: 6, marginBottom: 8 },
  monthLabel: { fontWeight: 'bold', fontSize: 18 },
});
