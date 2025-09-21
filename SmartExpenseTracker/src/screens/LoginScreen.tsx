import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

export default function LoginScreen({ onLogin, onSignup }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  return (
    <View style={styles.container}>
      {isSignup && (
        <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} />
      )}
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={() => isSignup ? onSignup(name, email, password) : onLogin(email, password)}
        style={styles.button}
      >
        {isSignup ? 'Sign Up' : 'Login'}
      </Button>

      <Text style={{ marginTop: 10, textAlign: 'center' }} onPress={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { marginBottom: 12 },
  button: { marginTop: 12 },
});
