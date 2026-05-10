import React from 'react';
import { NavigationContainer, TabActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LiveSpotScreen from './src/screens/LiveSpotScreen';
import HostScreen from './src/screens/HostScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RedigerProfilScreen from './src/screens/RedigerProfilScreen';
import BetalingsmetodeScreen from './src/screens/BetalingsmetodeScreen';
import ReservasjonshistorikkScreen from './src/screens/ReservasjonshistorikkScreen';
import VarslerScreen from './src/screens/VarslerScreen';
import PersonvernScreen from './src/screens/PersonvernScreen';
import HjelpFAQScreen from './src/screens/HjelpFAQScreen';
import KontaktOssScreen from './src/screens/KontaktOssScreen';
import VurderAppenScreen from './src/screens/VurderAppenScreen';
import LeiUtScreen from './src/screens/LeiUtScreen';
import RedigerPlassScreen from './src/screens/RedigerPlassScreen';
import KartScreen from './src/screens/KartScreen';
import LagretScreen from './src/screens/LagretScreen';
import BottomNav from './src/components/BottomNav';
import { SpotsProvider } from './src/context/SpotsContext';
import { AuthProvider } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const WWrappedWelcome                = wrap(WelcomeScreen);
const WWrappedLiveSpot               = wrap(LiveSpotScreen);
const WWrappedHost                   = wrap(HostScreen);
const WWrappedProfile                = wrap(ProfileScreen);
const WWrappedRedigerProfil          = wrap(RedigerProfilScreen);
const WWrappedBetalingsmetode        = wrap(BetalingsmetodeScreen);
const WWrappedReservasjonshistorikk  = wrap(ReservasjonshistorikkScreen);
const WWrappedVarsler                = wrap(VarslerScreen);
const WWrappedPersonvern             = wrap(PersonvernScreen);
const WWrappedHjelpFAQ               = wrap(HjelpFAQScreen);
const WWrappedKontaktOss             = wrap(KontaktOssScreen);
const WWrappedVurderAppen            = wrap(VurderAppenScreen);
const WWrappedLeiUt                  = wrap(LeiUtScreen);
const WWrappedRedigerPlass           = wrap(RedigerPlassScreen);
const WWrappedKart                   = wrap(KartScreen);
const WWrappedLagret                 = wrap(LagretScreen);

function ProfilStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Host"                    component={WWrappedHost} />
      <Stack.Screen name="Profile"                 component={WWrappedProfile} />
      <Stack.Screen name="RedigerProfil"           component={WWrappedRedigerProfil} />
      <Stack.Screen name="Betalingsmetoder"        component={WWrappedBetalingsmetode} />
      <Stack.Screen name="Reservasjonshistorikk"   component={WWrappedReservasjonshistorikk} />
      <Stack.Screen name="Varsler"                 component={WWrappedVarsler} />
      <Stack.Screen name="Personvern"              component={WWrappedPersonvern} />
      <Stack.Screen name="HjelpFAQ"                component={WWrappedHjelpFAQ} />
      <Stack.Screen name="KontaktOss"              component={WWrappedKontaktOss} />
      <Stack.Screen name="VurderAppen"             component={WWrappedVurderAppen} />
      <Stack.Screen name="LeiUt"                   component={WWrappedLeiUt} />
      <Stack.Screen name="RedigerPlass"            component={WWrappedRedigerPlass} />
    </Stack.Navigator>
  );
}

function HjemStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Welcome"  component={WWrappedWelcome} />
      <Stack.Screen name="LiveSpot" component={WWrappedLiveSpot} />
    </Stack.Navigator>
  );
}

function CustomTabBar({ state, navigation }) {
  const tabNames = ['Hjem', 'Kart', 'Lagret', 'Profil'];
  const activeTab = tabNames[state.index];

  return (
    <BottomNav
      activeTab={activeTab}
      onTabPress={(tabId) => {
        const index = tabNames.indexOf(tabId);
        if (index === -1) return;

        const route = state.routes[index];
        const isFocused = state.index === index;

        // Emit tabPress so nested stack navigators pop to their root
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
          navigation.dispatch({
            ...TabActions.jumpTo(route.name),
            target: state.key,
          });
        }
      }}
    />
  );
}

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
      <AuthProvider>
      <SpotsProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
          backBehavior="initialRoute"
        >
          <Tab.Screen name="Hjem"   component={HjemStack} />
          <Tab.Screen name="Kart"   component={WWrappedKart} />
          <Tab.Screen name="Lagret" component={WWrappedLagret} />
          <Tab.Screen name="Profil" component={ProfilStack} />
        </Tab.Navigator>
      </NavigationContainer>
      </SpotsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
