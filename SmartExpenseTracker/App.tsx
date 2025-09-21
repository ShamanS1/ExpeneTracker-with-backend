import React from 'react';
import { ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import useAuth from './src/auth/auth';
import LoginScreen from './src/screens/LoginScreen';
import MainApp from './src/screens/MainApp';
import { LightTheme } from './src/theme';

export default function App() {
  const { user, token, loading, login, signup, logout } = useAuth();

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <PaperProvider theme={LightTheme}>
      {!user ? (
        <LoginScreen onLogin={login} onSignup={signup} />
      ) : (
        <MainApp user={user} token={token || ''} onLogout={logout} />
      )}
    </PaperProvider>
  );
}
