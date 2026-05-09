import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LiveSpotScreen from './src/screens/LiveSpotScreen';
import HostScreen from './src/screens/HostScreen';

const Stack = createNativeStackNavigator();

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red', marginBottom: 12 }}>CRASH:</Text>
          <Text style={{ fontSize: 13, color: '#333', marginBottom: 12 }}>{this.state.error.message}</Text>
          <Text style={{ fontSize: 11, color: '#999' }}>{this.state.error.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const wrap = (Screen) => (props) => <ErrorBoundary><Screen {...props} /></ErrorBoundary>;

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require('./assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('./assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('./assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('./assets/fonts/Inter_700Bold.ttf'),
    Inter_800ExtraBold: require('./assets/fonts/Inter_800ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#F4F3F2', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#4EA7B9" /></View>;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'ios' }}>
          <Stack.Screen name="Welcome"  component={wrap(WelcomeScreen)} />
          <Stack.Screen name="LiveSpot" component={wrap(LiveSpotScreen)} />
          <Stack.Screen name="Host"     component={wrap(HostScreen)} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
