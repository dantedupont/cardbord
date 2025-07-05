import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Linking, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { auth, db } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

const getClientId = () => {
  if (Constants.expoConfig?.extra?.eas?.projectId) {
    if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
    if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
  }
  return process.env.EXPO_PUBLIC_EXPO_GO_IOS_CLIENT_ID;
};

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'short';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: getClientId(),
  });

  const debouncedCheckUsername = useRef(
    debounce(async (text: string) => {
      if (text.length === 0) { setUsernameStatus('idle'); return; }
      if (text.length < 3) { setUsernameStatus('short'); return; }
      setUsernameStatus('checking');
      const usernameDocRef = doc(db, "usernames", text.toLowerCase());
      const usernameDoc = await getDoc(usernameDocRef);
      setUsernameStatus(usernameDoc.exists() ? 'taken' : 'available');
    }, 500)
  ).current;

  useEffect(() => {
    if (usernameTouched) {
      debouncedCheckUsername(username);
    }
  }, [username, usernameTouched, debouncedCheckUsername]);


  useEffect(() => {
    const handleGoogleResponse = async () => {
    };
    handleGoogleResponse();
  }, [response]);

  const handleEmailSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "The password must be at least 6 characters long.");
      return;
    }
    if (usernameStatus !== 'available') {
      Alert.alert("Invalid Username", "Please choose an available username.");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("Agreement Required", "You must agree to the Privacy Policy to create an account.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      const userProfileRef = doc(db, "users", user.uid);
      const usernameDocRef = doc(db, "usernames", username.toLowerCase());
      const batch = writeBatch(db);
      
      batch.set(userProfileRef, {
        uid: user.uid, email: user.email, username: username, avatarUrl: '',
        createdAt: new Date(), hasCompletedOnboarding: false,
      });
      batch.set(usernameDocRef, { uid: user.uid });
      await batch.commit();

      Alert.alert("Account Created!", "Please check your inbox to verify your email address.");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUsernameFeedback = () => {
    switch (usernameStatus) {
      case 'checking': return <Text style={styles.feedbackText}>Checking...</Text>;
      case 'available': return <Text style={[styles.feedbackText, styles.availableText]}>Username is available!</Text>;
      case 'taken': return <Text style={[styles.feedbackText, styles.errorText]}>This username is already taken.</Text>;
      case 'short': return <Text style={[styles.feedbackText, styles.errorText]}>Username must be at least 3 characters.</Text>;
      default: return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputWrapper}>
          <TextInput style={styles.inputField} placeholder="Username" value={username} onChangeText={setUsername} onFocus={() => setUsernameTouched(true)} autoCapitalize="none" placeholderTextColor="#888" />
          <View style={styles.validationIcon}>
            {usernameStatus === 'checking' ? <ActivityIndicator size="small" /> : usernameStatus === 'available' || usernameStatus === 'taken' ? <Ionicons name={usernameStatus === 'available' ? 'checkmark-circle' : 'close-circle'} size={24} color={usernameStatus === 'available' ? '#28a745' : '#dc3545'} /> : null}
          </View>
        </View>
        {usernameTouched && <View style={styles.feedbackContainer}>{renderUsernameFeedback()}</View>}

        <View style={styles.inputWrapper}>
          <TextInput style={styles.inputField} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#888" />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput style={styles.inputField} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} placeholderTextColor="#888" />
          <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}><Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#888" /></Pressable>
        </View>
        <Text style={styles.inputHint}>6 character minimum</Text>

        <View style={styles.termsContainer}>
          <Pressable onPress={() => setAgreedToTerms(!agreedToTerms)} style={styles.checkbox}>
            {agreedToTerms && <View style={styles.checkboxChecked} />}
          </Pressable>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://cardbord-4d787.web.app/privacy.html')}>
              Privacy Policy
            </Text>.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={handleEmailSignup} disabled={loading || usernameStatus !== 'available'}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </Pressable>

        <View style={styles.separatorContainer}>
          <View style={styles.separator} /><Text style={styles.separatorText}>or</Text><View style={styles.separator} />
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    height: 50,
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  validationIcon: {
    paddingHorizontal: 10,
  },
  eyeIcon: {
    padding: 12,
  },
  inputHint: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: -12,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  feedbackContainer: {
    height: 20,
    marginTop: -12,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: '#6c757d',
  },
  availableText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 4, 
    marginRight: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkboxChecked: { 
    width: 12, 
    height: 12, 
    backgroundColor: '#007AFF', 
    borderRadius: 2 
  },
  termsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20, 
    marginTop: -10 
  },
  termsText: { 
    flex: 1, 
    fontSize: 12, 
    color: '#6c757d', 
    lineHeight: 18 
  },
  linkText: { 
    color: '#007AFF', 
    textDecorationLine: 'underline' 
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
