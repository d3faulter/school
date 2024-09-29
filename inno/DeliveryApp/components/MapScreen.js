// components/MapScreen.js

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
import { auth } from '../firebaseConfig';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';

const MapScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [showCurrentRouteOnly, setShowCurrentRouteOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [role, setRole] = useState(null); // To determine if user is trucker or company

  const db = getDatabase();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    // Fetch user role
    const userRoleRef = ref(db, `users/${user.uid}/role`);
    onValue(userRoleRef, (snapshot) => {
      const userRole = snapshot.val();
      setRole(userRole);
    }, {
      onlyOnce: true,
    });

    // Reference to user's currentRouteId
    const currentRouteIdRef = ref(db, `users/${user.uid}/currentRouteId`);

    // Listen for changes to currentRouteId
    const unsubscribeCurrentRouteId = onValue(currentRouteIdRef, (snapshot) => {
      const currentRouteId = snapshot.val();
      if (currentRouteId) {
        fetchCurrentRoute(currentRouteId);
      } else {
        setCurrentRoute(null);
      }
    });

    // Fetch all deliveries
    const deliveriesRef = ref(db, 'deliveries');
    const unsubscribeDeliveries = onValue(deliveriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedDeliveries = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setDeliveries(formattedDeliveries);
      } else {
        setDeliveries([]);
      }
    });

    // Fetch user's current location
    fetchUserLocation();

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCurrentRouteId();
      unsubscribeDeliveries();
    };
  }, []);

  // Function to fetch current route details
  const fetchCurrentRoute = (routeId) => {
    const routeRef = ref(db, `routes/${routeId}`);
    onValue(routeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentRoute({
          id: routeId,
          ...data,
        });
      } else {
        setCurrentRoute(null);
      }
    });
  };

  // Function to fetch user's current location
  const fetchUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Location Error', 'Failed to get current location.');
      console.error(error);
    }
  };

  // Function to toggle between all deliveries and current route's deliveries
  const toggleView = () => {
    setShowCurrentRouteOnly(!showCurrentRouteOnly);
  };

  // Function to navigate to ClientInputScreen with currentRouteId
  const navigateToAddDelivery = () => {
    if (!currentRoute) {
      Alert.alert('No Current Route', 'Please set a current route first.');
      return;
    }
    navigation.navigate('New Delivery', { routeId: currentRoute.id });
  };

  // Filtered deliveries based on toggle
  const filteredDeliveries = showCurrentRouteOnly && currentRoute
    ? deliveries.filter(delivery => delivery.routeId === currentRoute.id)
    : deliveries;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredDeliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            coordinate={{
              latitude: delivery.location ? delivery.location.latitude : 0,
              longitude: delivery.location ? delivery.location.longitude : 0,
            }}
            title={delivery.deliveryDetails}
            description={delivery.pickupAddress}
            onPress={() => navigation.navigate('RouteDetails', { delivery })}
          />
        ))}

        {currentRoute && currentRoute.coordinates && (
          <Polyline
            coordinates={currentRoute.coordinates}
            strokeColor="#1EB1FC"
            strokeWidth={3}
          />
        )}
      </MapView>

      {/* Toggle View Button */}
      {role === 'trucker' && (
        <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
          <Ionicons name={showCurrentRouteOnly ? 'list' : 'filter'} size={24} color="#fff" />
          <Text style={styles.buttonText}>
            {showCurrentRouteOnly ? 'Show All Deliveries' : 'Show Current Route'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Add Delivery Button */}
      {role === 'trucker' && (
        <TouchableOpacity style={styles.addButton} onPress={navigateToAddDelivery}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add to Route</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  map: { 
    flex: 1, 
  },
  toggleButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1EB1FC',
    padding: 10,
    borderRadius: 8,
    opacity: 0.8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default MapScreen;
