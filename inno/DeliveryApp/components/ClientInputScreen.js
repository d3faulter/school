// components/ClientInputScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import { getDatabase, ref, push } from 'firebase/database';
import { GEOCODE_MAPS_APIKEY } from '../firebaseConfig';

// Utility function for reverse geocoding
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await axios.get(`https://geocode.maps.co/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        api_key: GEOCODE_MAPS_APIKEY,
      },
    });

    console.log('Reverse Geocode Response:', response.data);

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

// Utility function for geocoding
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://geocode.maps.co/search', {
      params: {
        q: address,
        api_key: GEOCODE_MAPS_APIKEY,
      },
    });

    console.log('Geocode Response:', response.data);

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

const ClientInputScreen = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [showMap, setShowMap] = useState(false);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const { latitude, longitude } = location.coords;
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
      id: Date.now().toString(),
      pickupAddress,
      deliveryDetails,
      weight: parseFloat(weight),
      height: parseFloat(height),
      width: parseFloat(width),
      length: parseFloat(length),
      location: coords,
    };

    try {
      const db = getDatabase();
      const deliveryRef = ref(db, 'deliveries');
      await push(deliveryRef, newDelivery);
      Alert.alert('Success', 'Delivery created successfully.');
      navigation.navigate('Map');
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
            <Marker coordinate={location.coords} title="Selected Location" />
          )}
        </MapView>
      )}

      {/* Pickup Address */}
      <Text style={styles.label}>Pickup Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pickup address"
        value={pickupAddress}
        onChangeText={handleAddressChange}
      />

      {/* Coordinates */}
      <Text style={styles.label}>Or coordinates (written as: Latitude, Longitude)</Text>
      <TextInput
        style={styles.input}
        placeholder="Coordinates"
        value={`${coordinates.latitude}, ${coordinates.longitude}`}
        onChangeText={handleCoordinatesChange}
      />

      {/* Delivery Details */}
      <Text style={styles.label}>Delivery Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter delivery details"
        value={deliveryDetails}
        onChangeText={setDeliveryDetails}
      />

      {/* Weight */}
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter weight"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      {/* Height */}
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter height"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      {/* Width */}
      <Text style={styles.label}>Width (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter width"
        value={width}
        onChangeText={setWidth}
        keyboardType="numeric"
      />

      {/* Length */}
      <Text style={styles.label}>Length (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter length"
        value={length}
        onChangeText={setLength}
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