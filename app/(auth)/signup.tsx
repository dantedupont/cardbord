import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { auth, db } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  });

  // This useEffect handles the response from Google Sign-In
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        setLoading(true);
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        
        try {
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;

          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            const randomString = Math.random().toString(36).substring(2, 7);
            const defaultUsername = `user_${randomString}`;
            const avatarUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.uid}`;

            // For Google sign-up, we create a default profile. They can change their username later.
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              username: defaultUsername,
              avatarUrl: avatarUrl,
              createdAt: new Date(),
            });
          }
        } catch (error: any) {
          Alert.alert("Sign-In Failed", "Could not sign in with Google.");
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'error') {
        Alert.alert("Sign-In Failed", "An error occurred during Google sign-in.");
      }
    };
    
    handleGoogleResponse();
  }, [response]);

  // This function handles sign-up with email, password, and a chosen username
  const handleEmailSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    
    if (password.length < 6) {
      Alert.alert("Weak Password", "The password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Check if the username is already taken
      const usernameDocRef = doc(db, "usernames", username.toLowerCase());
      const usernameDoc = await getDoc(usernameDocRef);
      if (usernameDoc.exists()) {
        Alert.alert("Username Taken", "This username is already in use. Please choose another.");
        setLoading(false);
        return;
      }

      // 2. If username is available, create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Create the user profile and reserve the username in a single batch operation
      const userProfileRef = doc(db, "users", user.uid);
      const avatarUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.uid}`;

      const batch = writeBatch(db);
      
      // Set the main user profile document
      batch.set(userProfileRef, {
        uid: user.uid,
        email: user.email,
        username: username,
        avatarUrl: avatarUrl,
        createdAt: new Date(),
      });

      // Set the username reservation document
      batch.set(usernameDocRef, { uid: user.uid });

      await batch.commit();
      
      console.log('User profile and username reservation created!');

    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        <Text style={styles.inputHint}>6 character minimum</Text>

        <Pressable style={styles.button} onPress={handleEmailSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </Pressable>

        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separator} />
        </View>

        <Pressable style={[styles.button, styles.googleButton]} disabled={!request || loading} onPress={() => promptAsync()}>
          {loading ? <ActivityIndicator /> : <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => router.back()} disabled={loading}>
          <Text style={styles.linkButtonText}>Already have an account? Login</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  // --- NEW: Style for the hint text ---
  inputHint: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: -12, // Pulls the text up closer to the input field
    marginBottom: 16, // Adds space below it before the button
    paddingHorizontal: 8,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  googleButtonText: {
    color: '#333',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#888',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
