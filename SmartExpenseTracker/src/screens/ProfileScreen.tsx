import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Card, useTheme } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = {
  user: { id: string; name: string; email: string; profileImage?: string };
  token: string;
  onUpdate: (updatedUser: any) => void;
  onLogout: () => void;
};

export default function ProfileScreen({ user, token, onUpdate, onLogout }: Props) {
  const theme = useTheme();
  const [name, setName] = useState(user.name);
  const [profileImage, setProfileImage] = useState<string | undefined>(user.profileImage);
  const [loading, setLoading] = useState(false);

  // Image picker (kept unchanged)
  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (asset?.uri) {
        const uri = Platform.OS === 'android' && !asset.uri.startsWith('file://') ? `file://${asset.uri}` : asset.uri;
        setProfileImage(uri);
      }
    } catch (e) {
      console.error('Image picker error:', e);
    }
  };

  // Profile update (kept unchanged)
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);

      if (profileImage) {
        const uri = profileImage.startsWith('file://') ? profileImage : `file://${profileImage}`;
        const fileName = uri.split('/').pop()!;
        formData.append('profileImage', {
          uri,
          type: 'image/jpeg',
          name: fileName,
        } as any);
      }

      const res = await fetch(`http://192.168.29.47:5001/api/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        console.error('Server returned non-JSON:', text);
        Alert.alert('Error', 'Server returned invalid response');
        setLoading(false);
        return;
      }

      if (res.ok) {
        onUpdate(data);
        if (data.profileImage) setProfileImage(data.profileImage);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : undefined}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={user.email}
            disabled
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleUpdate}
            loading={loading}
            style={styles.button}
          >
            Update Profile
          </Button>

          <Button
            mode="outlined"
            onPress={onLogout}
            style={[styles.button, { marginTop: 8 }]}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: {
    backgroundColor: '#2196F3',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#fff', backgroundColor: '#ddd' },
  card: { margin: 16, padding: 16, borderRadius: 12, elevation: 4 },
  input: { marginBottom: 12 },
  button: { width: '100%', marginTop: 12 },
});
