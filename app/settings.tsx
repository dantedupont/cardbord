import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { deleteUser, signOut } from 'firebase/auth';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { auth } from '../firebase';

export default function SettingsScreen() {

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign Out Error", error));
    // The main layout's auth listener will handle the redirect.
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This action is permanent and will delete all your data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;
            if (user) {
              try {
                await deleteUser(user);
                Alert.alert("Account Deleted", "Your account has been successfully deleted.");
              } catch (error: any) {
                console.error("Delete Account Error:", error);
                Alert.alert("Error", "Could not delete account. Please sign out and sign back in, then try again.");
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings', headerBackTitle: 'Profile' }} />
      
      <Pressable style={styles.menuButton} onPress={handleSignOut}>
        <Text style={styles.menuButtonText}>Sign Out</Text>
        <Ionicons name="log-out-outline" size={24} color="#6c757d" />
      </Pressable>

      <Pressable style={styles.menuButton} onPress={handleDeleteAccount}>
        <Text style={[styles.menuButtonText, styles.deleteText]}>Delete Account</Text>
        <Ionicons name="trash-outline" size={24} color="#dc3545" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  deleteText: {
    color: '#dc3545',
  },
});
