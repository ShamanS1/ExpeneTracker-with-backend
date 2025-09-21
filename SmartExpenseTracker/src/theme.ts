import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#FAFAFA',
    surface: '#FFFFFF',
    primary: '#2196F3',
    secondary: '#616161',
    text: '#212121',
    onSurface: '#212121',
    income: '#4CAF50',
    expenses: '#F44336',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#64B5F6',
    secondary: '#B0B0B0',
    text: '#E0E0E0',
    onSurface: '#E0E0E0',
    income: '#81C784',
    expenses: '#EF5350',
  },
};
