// navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ClientInputScreen from '../components/ClientInputScreen';
import MapScreen from '../components/MapScreen';
import TruckerInputScreen from '../components/TruckerInputScreen';
import RouteDetailsScreen from '../components/RouteDetailsScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="RouteDetails" component={RouteDetailsScreen} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Map" component={MapStack} />
    <Tab.Screen name="Create Delivery" component={ClientInputScreen} />
    <Tab.Screen name="Profile" component={TruckerInputScreen} />
  </Tab.Navigator>
);

export default AppNavigator;
