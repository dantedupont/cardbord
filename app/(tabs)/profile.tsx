import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged, sendEmailVerification, User } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MeepleAvatar from '../../components/MeepleAvatar';
import { auth, db } from '../../firebase';

type UserProfile = {
  username: string;
  email: string;
  avatarUrl: string; 
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isBannerVisible, setBannerVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          setProfile(userProfile);
          setNewUsername(userProfile.username);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleResendVerification = () => {
    if (user) {
      sendEmailVerification(user)
        .then(() => Alert.alert("Email Sent", "A new verification link has been sent..."))
        .catch((error) => Alert.alert("Error", "Could not send verification email..."));
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;
    if (newUsername === profile.username) {
      setEditMode(false);
      return;
    }
    setIsSaving(true);
    try {
      const newUsernameRef = doc(db, 'usernames', newUsername.toLowerCase());
      const newUsernameDoc = await getDoc(newUsernameRef);
      if (newUsernameDoc.exists()) {
        Alert.alert("Username Taken", "This username is already in use.");
        setIsSaving(false);
        return;
      }
      const batch = writeBatch(db);
      const userDocRef = doc(db, 'users', user.uid);
      batch.update(userDocRef, { username: newUsername });
      const oldUsernameRef = doc(db, 'usernames', profile.username.toLowerCase());
      batch.delete(oldUsernameRef);
      batch.set(newUsernameRef, { uid: user.uid });
      await batch.commit();
      setProfile(prev => prev ? { ...prev, username: newUsername } : null);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color="#007AFF" />
            </Pressable>
          ),
        }}
      />

      {profile && user ? (
        <>
          {!user.emailVerified && isBannerVisible && (
            <View style={styles.banner}>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerText}>Please verify your email to unlock all features.</Text>
                <Pressable onPress={handleResendVerification}><Text style={styles.resendText}>Resend Email</Text></Pressable>
              </View>
              <Pressable onPress={() => setBannerVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="#856404" />
              </Pressable>
            </View>
          )}

          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MeepleAvatar seed={user.uid} size={112} />
            </View>
            
            {editMode ? (
              <TextInput style={styles.usernameInput} value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" />
            ) : (
              <View style={styles.usernameContainer}>
                <Text style={styles.username}>{profile.username}</Text>
                <Pressable onPress={() => setEditMode(true)} style={styles.editButton}>
                  <Ionicons name="pencil" size={20} color="#6c757d" />
                </Pressable>
              </View>
            )}
            <Text style={styles.email}>{profile.email}</Text>
          </View>

          <View style={styles.contentArea}>
            <Pressable style={styles.menuButton} onPress={() => router.push('/my-ratings')}>
              <Text style={styles.menuButtonText}>My Ratings</Text>
              <Ionicons name="chevron-forward" size={24} color="#6c757d" />
            </Pressable>
            <Pressable 
              style={styles.menuButton} 
              onPress={() => router.push('/game/30549')}
            >
              <Text style={styles.menuButtonText}>Test Game Page (Pandemic)</Text>
              <Ionicons name="chevron-forward" size={24} color="#6c757d" />
            </Pressable>
          </View>

          {editMode && (
            <View style={styles.editButtonsContainer}>
              <Pressable style={[styles.buttonBase, styles.cancelButton]} onPress={() => setEditMode(false)}><Text style={styles.cancelButtonText}>Cancel</Text></Pressable>
              <Pressable style={[styles.buttonBase, styles.saveButton]} onPress={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </Pressable>
            </View>
          )}
        </>
      ) : (
        <Text>No user is signed in.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  banner: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    color: '#856404',
    fontSize: 14,
  },
  resendText: {
    color: '#856404',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  closeButton: {
    paddingLeft: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 16,
    backgroundColor: '#e9ecef',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    textAlign: 'center',
    minWidth: 150,
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  menuButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginBottom: 100,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 100,
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
});
