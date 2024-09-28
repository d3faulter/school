// navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, StyleSheet } from 'react-native';
import ClientInputScreen from '../components/ClientInputScreen';
import MapScreen from '../components/MapScreen';
import TruckerInputScreen from '../components/TruckerInputScreen';
import RouteDetailsScreen from '../components/RouteDetailsScreen';
import RoutesScreen from '../components/RoutesScreen';
import LoginScreen from '../components/LoginScreen';
import RegisterScreen from '../components/RegisterScreen';

const Stack = createStackNavigator();

function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapHome" component={MapScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
    </Stack.Navigator>
  );
}

function RoutesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoutesHome" component={RoutesScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={TruckerInputScreen} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer>
        {user ? (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ color, size }) => {
                let iconName;
                if (route.name === 'Map') {
                  iconName = 'map';
                } else if (route.name === 'Profile') {
                  iconName = 'person';
                } else if (route.name === 'New Delivery') {
                  iconName = 'add-circle';
                } else if (route.name === 'Routes') {
                  iconName = 'list';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              headerShown: false, // Hide the larger headers
            })}
          >
            <Tab.Screen name="Map" component={MapStack} />
            <Tab.Screen name="New Delivery" component={ClientInputScreen} />
            <Tab.Screen name="Routes" component={RoutesStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
          </Tab.Navigator>
        ) : (
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AppNavigator;