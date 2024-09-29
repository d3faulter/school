// components/ClientInputScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { getDatabase, ref, push, set, update, onValue } from 'firebase/database';
import { GEOCODE_MAPS_APIKEY, auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(`https://geocode.maps.co/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        api_key: GEOCODE_MAPS_APIKEY,
      },
    });

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    } else {
      Alert.alert('Reverse Geocoding Error', 'No address found for the provided coordinates.');
      return null;
    }
  } catch (error) {
    Alert.alert('Reverse Geocoding Error', 'Failed to convert coordinates to address.');
    console.error(error);
    return null;
  }
};

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://geocode.maps.co/search', {
      params: {
        q: address,
        api_key: GEOCODE_MAPS_APIKEY,
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } else {
      Alert.alert('Geocoding Error', 'No results found for the provided address.');
      return null;
    }
  } catch (error) {
    Alert.alert('Geocoding Error', 'Failed to convert address to coordinates.');
    console.error(error);
    return null;
  }
};

const ClientInputScreen = ({ navigation, route }) => {
  const { routeId } = route.params || {}; // Get routeId if provided
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [showMap, setShowMap] = useState(false);
  const [role, setRole] = useState(null);

  const db = getDatabase();

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRoleRef = ref(db, `users/${user.uid}/role`);
        onValue(userRoleRef, (snapshot) => {
          const userRole = snapshot.val();
          setRole(userRole);
          if (userRole !== 'company') {
            Alert.alert('Access Denied', 'You do not have permission to access this page.');
            navigation.goBack();
          }
        }, {
          onlyOnce: true,
        });
      } else {
        Alert.alert('Authentication Required', 'Please log in first.');
        navigation.navigate('Login');
      }
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const { latitude, longitude } = loc.coords;
      setCoordinates({ latitude, longitude });

      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      if (address) {
        setPickupAddress(address);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ coords: { latitude, longitude } });
    setCoordinates({ latitude, longitude });

    // Reverse geocode to get address
    reverseGeocode(latitude, longitude).then((address) => {
      if (address) {
        setPickupAddress(address);
      }
    });
  };

  const handleAddressChange = async (address) => {
    setPickupAddress(address);
    const coords = await geocodeAddress(address);
    if (coords) {
      setCoordinates(coords);
      setLocation({ coords });
    }
  };

  const handleCoordinatesChange = async (coordsString) => {
    const [latitude, longitude] = coordsString.split(',').map(coord => parseFloat(coord.trim()));
    if (!isNaN(latitude) && !isNaN(longitude)) {
      setCoordinates({ latitude, longitude });
      setLocation({ coords: { latitude, longitude } });

      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      if (address) {
        setPickupAddress(address);
      }
    }
  };

  const handleCreateDelivery = async () => {
    if (!pickupAddress || !deliveryDetails || !weight || !height || !width || !length) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    let coords = location ? location.coords : null;
    if (!coords) {
      coords = await geocodeAddress(pickupAddress);
      if (!coords) return;
    }
  
    const newDelivery = {
      pickupAddress,
      deliveryDetails,
      weight: parseFloat(weight),
      height: parseFloat(height),
      width: parseFloat(width),
      length: parseFloat(length),
      location: coords,
      routeId: routeId || null, // Associate with route if routeId is provided
      status: 'pending', // Optional: Add status field
    };
  
    try {
      const deliveryRef = ref(db, 'deliveries');
      const newRef = push(deliveryRef); // Generates a unique key
      await set(newRef, newDelivery); // Saves the delivery data under the unique key

      // If routeId is provided, add this delivery to the route's deliveryIds
      if (routeId) {
        const routeDeliveriesRef = ref(db, `routes/${routeId}/deliveryIds`);
        // Use transaction to safely add to array
        onValue(routeDeliveriesRef, (snapshot) => {
          const currentDeliveries = snapshot.val() || [];
          const updatedDeliveries = [...currentDeliveries, newRef.key];
          update(routeDeliveriesRef, { deliveryIds: updatedDeliveries })
            .then(() => {
              console.log('Delivery added to route.');
            })
            .catch((error) => {
              console.error('Error adding delivery to route:', error);
            });
        }, {
          onlyOnce: true,
        });
      }

      Alert.alert('Success', 'Delivery created successfully.');
      navigation.goBack(); // Navigate back to the previous screen (MapScreen)
    } catch (error) {
      Alert.alert('Database Error', 'Failed to create delivery.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Delivery</Text>

      {/* Get Current Location Button */}
      <Button title="Get Current Location" onPress={getCurrentLocation} />

      {/* Toggle Map View */}
      <TouchableOpacity onPress={() => setShowMap(!showMap)}>
        <Text style={styles.toggleMapText}>{showMap ? 'Hide Map' : 'Show Map'}</Text>
      </TouchableOpacity>

      {showMap && (
        <MapView style={styles.map} onPress={handleMapPress}>
          {location && (
            <Marker 
              key={`selectedLocation-${location.coords.latitude}-${location.coords.longitude}`} 
              coordinate={location.coords} 
              title="Selected Location" 
            />
          )}
        </MapView>
      )}

      {/* Pickup Address */}
      <Text style={styles.label}>Pickup Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pickup address"
        value={pickupAddress}
        onChangeText={handleAddressChange} // Correct usage, receives text directly
      />

      {/* Coordinates */}
      <Text style={styles.label}>Or coordinates (written as: Latitude, Longitude)</Text>
      <TextInput
        style={styles.input}
        placeholder="Coordinates"
        value={`${coordinates.latitude}, ${coordinates.longitude}`}
        onChangeText={handleCoordinatesChange} // Correct usage, receives text directly
      />

      {/* Delivery Details */}
      <Text style={styles.label}>Delivery Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter delivery details"
        value={deliveryDetails}
        onChangeText={setDeliveryDetails} // Correct usage, receives text directly
      />

      {/* Weight */}
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter weight"
        value={weight}
        onChangeText={setWeight} // Correct usage, receives text directly
        keyboardType="numeric"
      />

      {/* Height */}
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter height"
        value={height}
        onChangeText={setHeight} // Correct usage, receives text directly
        keyboardType="numeric"
      />

      {/* Width */}
      <Text style={styles.label}>Width (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter width"
        value={width}
        onChangeText={setWidth} // Correct usage, receives text directly
        keyboardType="numeric"
      />

      {/* Length */}
      <Text style={styles.label}>Length (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter length"
        value={length}
        onChangeText={setLength} // Correct usage, receives text directly
        keyboardType="numeric"
      />

      {/* Create Delivery Button */}
      <Button title="Create Delivery" onPress={handleCreateDelivery} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: { 
    fontSize: 16, 
    marginBottom: 5,
    color: '#333',
  },
  input: { 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    marginBottom: 20, 
    paddingHorizontal: 10, 
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  map: { 
    height: 300, 
    marginBottom: 20, 
    borderRadius: 10,
  },
  toggleMapText: {
    color: '#007BFF',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ClientInputScreen;