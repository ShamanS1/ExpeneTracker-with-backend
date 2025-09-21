import React, { useState, useEffect } from 'react';
import { Text, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Provider as PaperProvider } from 'react-native-paper';

import DashboardScreen from './DashboardScreen';
import ExpensesScreen from './ExpensesScreen';
import AddExpenseScreen from './AddExpenseScreen';
import EditExpenseScreen from './EditExpenseScreen';
import { LightTheme, DarkTheme,  } from '../theme';
import { Expense } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type Props = {
  user: any;
  token: string;
  onLogout: () => void;
};

export default function MainApp({ user, token, onLogout }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // SYNCED MONTH/YEAR STATE
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
  };

  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const theme = isDarkMode ? DarkTheme : LightTheme;

  // Expenses Stack
  const ExpensesStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="ExpensesHome" options={{ title: 'Expenses' }}>
        {({ navigation }) => (
          <ExpensesScreen
            expenses={expenses}
            deleteExpense={deleteExpense}
            updateExpense={updateExpense}
            navigation={navigation}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AddExpense" options={{ title: 'Add Expense' }}>
        {({ navigation }) => <AddExpenseScreen addExpense={addExpense} navigation={navigation} />}
      </Stack.Screen>

      <Stack.Screen name="EditExpense" options={{ title: 'Edit Expense' }}>
        {({ navigation, route }) => (
          <EditExpenseScreen navigation={navigation} route={route} updateExpense={updateExpense} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );

  return (
    <PaperProvider theme={theme} settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color }) => {
              let icon = '';
              if (route.name === 'Dashboard') icon = focused ? '📊' : '📈';
              else if (route.name === 'Expenses') icon = focused ? '💰' : '🧾';
              return <Text style={{ fontSize: 18, color }}>{icon}</Text>;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Dashboard">
            {() => (
              <DashboardScreen
                expenses={expenses}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                setSelectedMonth={setSelectedMonth}
                setSelectedYear={setSelectedYear}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Expenses" options={{ headerShown: false }}>
            {ExpensesStack}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
