// components/ClientInputScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import { getDatabase, ref, push } from 'firebase/database';

const ClientInputScreen = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [location, setLocation] = useState(null);

  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get('https://geocode.maps.co/search', {
        params: {
          q: address,
          api_key: Constants.expoConfig.extra.GEOCODE_MAPS_APIKEY,
        },
      });
      const { lat, lon } = response.data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (error) {
      Alert.alert('Geocoding Error', 'Failed to convert address to coordinates');
      console.error(error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Location Error', 'Failed to get current location');
      console.error(error);
    }
  };

  const handleMapPress = (e) => {
    setLocation(e.nativeEvent.coordinate);
  };

  const handleCreateDelivery = async () => {
    if (!pickupAddress || !deliveryDetails || !weight || !height || !width || !length) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const coords = location || await geocodeAddress(pickupAddress);
    if (!coords) return;

    const newDelivery = {
      id: Date.now().toString(),
      pickupAddress,
      deliveryDetails,
      weight,
      height,
      width,
      length,
      location: coords,
    };

    try {
      const db = getDatabase();
      const deliveryRef = ref(db, 'deliveries');
      await push(deliveryRef, newDelivery);
      Alert.alert('Success', 'Delivery created successfully');
      navigation.navigate('Map');
    } catch (error) {
      Alert.alert('Database Error', 'Failed to create delivery');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Delivery</Text>
      <Text style={styles.label}>Pickup Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pickup address"
        value={pickupAddress}
        onChangeText={setPickupAddress}
      />
      <Text style={styles.label}>Delivery Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter delivery details"
        value={deliveryDetails}
        onChangeText={setDeliveryDetails}
      />
      <Text style={styles.label}>Weight</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter weight"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Height</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter height"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Width</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter width"
        value={width}
        onChangeText={setWidth}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Length</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter length"
        value={length}
        onChangeText={setLength}
        keyboardType="numeric"
      />
      <Button title="Get Current Location" onPress={getCurrentLocation} />
      <MapView style={styles.map} onPress={handleMapPress}>
        {location && (
          <Marker coordinate={location} />
        )}
      </MapView>
      <Button title="Create Delivery" onPress={handleCreateDelivery} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 },
  map: { height: 300, marginBottom: 20 },
});

export default ClientInputScreen;