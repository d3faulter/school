import { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID } from '@env';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getApps, initializeApp } from "firebase/app";
import Ionicons from 'react-native-vector-icons/Ionicons';
import CarList from './components/CarList';
import CarDetails from './components/CarDetails';
import Add_edit_Car from './components/Add_edit_Car';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Vi kontrollerer at der ikke allerede er en initialiseret instans af firebase
// Så undgår vi fejlen Firebase App named '[DEFAULT]' already exists (app/duplicate-app).
if (getApps().length < 1) {
  initializeApp(firebaseConfig);
  console.log("Firebase On!");
  // Initialize other firebase products here
}

export default function App() {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();

  const StackNavigation = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="CarList" component={CarList} />
        <Stack.Screen name="CarDetails" component={CarDetails} />
        <Stack.Screen name="Add_edit_Car" component={Add_edit_Car} />
      </Stack.Navigator>
    );
  }

  const BottomNavigation = () => {
    return (
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen 
            name="Home" 
            component={StackNavigation} 
            options={{ tabBarIcon: () => (<Ionicons name="home" size={20} />), headerShown: false }} 
          />
          <Tab.Screen 
            name="Add_edit_Car" 
            component={Add_edit_Car} 
            options={{ tabBarIcon: () => (<Ionicons name="add" size={20} />), headerShown: false }} 
          />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    );
  }

  return (
    <BottomNavigation />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});