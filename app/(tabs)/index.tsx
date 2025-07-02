import { Ionicons } from '@expo/vector-icons'; // For the edit icon
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../../firebase'; // Import your central firebase config

// Define a type for our user profile data
type UserProfile = {
  username: string;
  avatarUrl: string;
  email: string;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userProfile = userDoc.data() as UserProfile;
          setProfile(userProfile);
          setNewUsername(userProfile.username); // Initialize edit field with current username
        } else {
          console.log("No user profile found in Firestore!");
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign Out Error", error));
  };

  const handleSaveProfile = async () => {
    if (!profile || !auth.currentUser) return;
    // Do nothing if the username hasn't changed
    if (newUsername === profile.username) {
      setEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Check if the new username is already taken
      const newUsernameRef = doc(db, 'usernames', newUsername.toLowerCase());
      const newUsernameDoc = await getDoc(newUsernameRef);
      if (newUsernameDoc.exists()) {
        Alert.alert("Username Taken", "This username is already in use.");
        setIsSaving(false);
        return;
      }

      // 2. Perform a batch write to update everything at once
      const batch = writeBatch(db);
      
      // Update the user's profile document
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      batch.update(userDocRef, { username: newUsername });

      // Delete the old username reservation
      const oldUsernameRef = doc(db, 'usernames', profile.username.toLowerCase());
      batch.delete(oldUsernameRef);

      // Create the new username reservation
      batch.set(newUsernameRef, { uid: auth.currentUser.uid });

      await batch.commit();

      // 3. Update the local state to reflect the change instantly
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
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile ? (
        <>
          <View style={styles.profileHeader}>
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            {editMode ? (
              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
              />
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
            <Text style={styles.placeholderText}>Top 5 Games will go here...</Text>
          </View>

          {editMode ? (
            <View style={styles.editButtonsContainer}>
              <Pressable style={[styles.buttonBase, styles.cancelButton]} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.buttonBase, styles.saveButton]} onPress={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </Pressable>
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
    paddingTop: 80,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 16,
    backgroundColor: '#e9ecef',
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
  },
  placeholderText: {
    textAlign: 'center',
    color: '#adb5bd',
    marginTop: 40,
    fontSize: 16,
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
