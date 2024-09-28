// components/MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { firebase } from '../firebaseConfig';
import * as Location from 'expo-location';

const MapScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const deliveriesRef = firebase.database().ref('deliveries');
    const onValueChange = deliveriesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const deliveriesList = [];
      for (let id in data) {
        deliveriesList.push({ id, ...data[id] });
      }
      setDeliveries(deliveriesList);
    });

    // Cleanup listener on unmount
    return () => deliveriesRef.off('value', onValueChange);
  }, []);

  const optimizeRoutes = async () => {
    const user = firebase.auth().currentUser;
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to optimize routes.');
      return;
    }

    try {
      const userRef = firebase.database().ref('users/' + user.uid);
      const snapshot = await userRef.once('value');
      const preferences = snapshot.val();

      if (!preferences) {
        Alert.alert('Preferences Missing', 'Please set your preferences in your profile.');
        return;
      }

      // Filter deliveries based on preferences
      const filteredDeliveries = deliveries.filter((delivery) => {
        // Implement actual filtering logic based on preferences
        // Example: Check if delivery is within preferred countries
        if (preferences.preferredCountries && preferences.preferredCountries.length > 0) {
          // Assuming 'address' contains country information
          const deliveryCountry = delivery.address.split(',').pop().trim();
          return preferences.preferredCountries.includes(deliveryCountry);
        }
        return true; // If no country preference, include all
      });

      // Get current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const currentCoords = location.coords;

      // Sort deliveries based on distance using Haversine formula
      filteredDeliveries.sort((a, b) => {
        const distanceA = getDistance(currentCoords, a.location);
        const distanceB = getDistance(currentCoords, b.location);
        return distanceA - distanceB;
      });

      // Create a route with sorted deliveries
      const routeCoordinates = [currentCoords, ...filteredDeliveries.map((delivery) => delivery.location)];

      setRoutes([
        {
          coordinates: routeCoordinates,
          earnings: calculateEarnings(filteredDeliveries),
        },
      ]);

      Alert.alert('Routes Optimized', 'Routes have been optimized based on your preferences.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while optimizing routes.');
    }
  };

  const getDistance = (coord1, coord2) => {
    // Haversine formula for distance in kilometers
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const calculateEarnings = (deliveries) => {
    // Implement a real earnings calculation based on deliveries and truck data
    return deliveries.length * 100; // Placeholder: $100 per delivery
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            coordinate={{
              latitude: delivery.location ? delivery.location.latitude : 0,
              longitude: delivery.location ? delivery.location.longitude : 0,
            }}
            title={delivery.deliveryDetails}
            description={delivery.address}
            onPress={() => navigation.navigate('RouteDetails', { delivery })}
          />
        ))}

        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route.coordinates}
            strokeColor="#000"
            strokeWidth={3}
          />
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Optimize Routes" onPress={optimizeRoutes} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: '25%',
    right: '25%',
  },
});

export default MapScreen;
