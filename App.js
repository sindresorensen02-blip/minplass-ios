import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LiveSpotScreen from './src/screens/LiveSpotScreen';
import HostScreen from './src/screens/HostScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('./assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('./assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('./assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('./assets/fonts/Inter_700Bold.ttf'),
    Inter_800ExtraBold: require('./assets/fonts/Inter_800ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F3F2' }}>
        <ActivityIndicator color="#4EA7B9" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'ios' }}>
          <Stack.Screen name="Welcome"  component={WelcomeScreen} />
          <Stack.Screen name="LiveSpot" component={LiveSpotScreen} />
          <Stack.Screen name="Host"     component={HostScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
