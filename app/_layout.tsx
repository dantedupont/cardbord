import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import User type
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { ModalProvider } from '../context/ModalContext';
import { auth, db } from '../firebase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // This effect runs once and sets up a listener. Its only job
  // is to update the user state when the login status changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Handle routing based on the auth state ---
  useEffect(() => {
    // Don't route until we know the auth state for sure.
    if (isAuthLoading) {
      return;
    }

    const checkOnboardingAndRoute = async () => {
      if (user) {
        // User is logged in, check their profile for onboarding status
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().hasCompletedOnboarding) {
            router.replace('/profile'); 
          } else {
            router.replace('/onboarding');
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          router.replace('/(auth)/login');
        }
      } else {
        // User is not logged in
        router.replace('/(auth)/login');
      }
    };

    checkOnboardingAndRoute();
  }, [user, isAuthLoading, router]); // This logic now correctly depends on the user state
  
  if (!loaded || isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ModalProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="diary" 
            options={{ 
              title: 'Gaming Diary',
              headerStyle: { backgroundColor: '#f8f9fa' },
              headerTitleStyle: { fontWeight: 'bold' },
            }} 
          />
          <Stack.Screen name="settings" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ModalProvider>
  );
}
