import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, Card, Avatar } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onLogin: (email: string, password: string) => void;
  onSignup: (name: string, email: string, password: string) => void;
};

export default function LoginScreen({ onLogin, onSignup }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  // Animated values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = login, 1 = signup

  const toggleForm = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsSignup(!isSignup);
      Animated.timing(slideAnim, {
        toValue: isSignup ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <LinearGradient colors={['#2196F3', '#64B5F6']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
  <View style={styles.header}>
    <Avatar.Icon
      size={80}
      icon="wallet"
      style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
    />
    <Text style={[styles.appName, { color: '#fff' }]}>Expense Tracker</Text>
  </View>

  <Card style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.85)' }]}>
    <Card.Content style={{ paddingVertical: 20 }}>
      <Animated.View style={{ opacity: fadeAnim, alignSelf: 'stretch' }}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          {isSignup ? 'Sign Up' : 'Login'}
        </Text>

        {isSignup && (
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={() =>
            isSignup ? onSignup(name, email, password) : onLogin(email, password)
          }
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          contentStyle={{ paddingVertical: 6 }}
        >
          {isSignup ? 'Sign Up' : 'Login'}
        </Button>

        <TouchableOpacity onPress={toggleForm} style={styles.switchContainer}>
          <Text style={{ color: theme.colors.secondary, textAlign: 'center' }}>
            {isSignup
              ? 'Already have an account? Login'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Card.Content>
  </Card>
</ScrollView>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
  },
  scrollContainer: {
  flexGrow: 1,
  justifyContent: 'center',
  paddingHorizontal: 16, // ensures padding on sides
  alignItems: 'center',   // center card horizontally
},
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
  width: '100%',           // full width inside scroll container
  maxWidth: 400,           // optional: constrain on large screens
  borderRadius: 16,
  elevation: 6,
},
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  switchContainer: {
    marginTop: 12,
  },
});
