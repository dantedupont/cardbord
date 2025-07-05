import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { auth, db } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

const getClientId = () => {
  if (Constants.expoConfig?.extra?.eas?.projectId) {
    // This is a custom development build.
    if (Platform.OS === 'ios') {
      return process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
    } else if (Platform.OS === 'android') {
      return process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
    }
  }
  // This is running in the Expo Go app.
  return process.env.EXPO_PUBLIC_EXPO_GO_IOS_CLIENT_ID;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: getClientId(),
  });

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
            
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              username: defaultUsername,
              avatarUrl: '',
              createdAt: new Date(),
              hasCompletedOnboarding: false,
            });
          }
        } catch (error: any) {
          console.error("Google Sign-In Error:", error);
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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        Alert.alert("Login Failed", error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        
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

        <Pressable style={styles.forgotPasswordButton} onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
        </Pressable>

        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separator} />
        </View>

        <Pressable style={[styles.button, styles.googleButton]} disabled={!request || loading} onPress={() => promptAsync()}>
          {loading ? <ActivityIndicator /> : <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.linkButtonText}>Don&apos;t have an account? Sign Up</Text>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  button: {
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
