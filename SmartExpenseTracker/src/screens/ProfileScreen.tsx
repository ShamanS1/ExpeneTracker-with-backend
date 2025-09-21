import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = {
  user: { id: string; name: string; email: string; profileImage?: string };
  token: string;
  onUpdate: (updatedUser: any) => void;
  onLogout: () => void;
};

export default function ProfileScreen({ user, token, onUpdate, onLogout }: Props) {
  const [name, setName] = useState(user.name);
  const [profileImage, setProfileImage] = useState<string | undefined>(user.profileImage);
  const [loading, setLoading] = useState(false);

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.5 });
      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Image picker error:', e);
    }
  };

  // Update profile
  const handleUpdate = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);

      if (profileImage && profileImage.startsWith('file://')) {
        const fileName = profileImage.split('/').pop()!;
        formData.append('profileImage', {
          uri: profileImage,
          type: 'image/jpeg',
          name: fileName,
        } as any);
      }

      const res = await fetch(`http://192.168.29.47:5001/api/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
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
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : undefined}
          style={styles.avatar}
        />
      </TouchableOpacity>

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
        style={styles.button}
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#fff' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, backgroundColor: '#ddd' },
  input: { width: '100%', marginBottom: 12 },
  button: { width: '100%', marginTop: 12 },
});
