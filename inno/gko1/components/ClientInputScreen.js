// components/ClientInputScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firebase } from '../firebaseConfig';
import * as Location from 'expo-location';

const ClientInputScreen = () => {
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);

  const getLocationFromGPS = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  };

  const submitDelivery = () => {
    if (!deliveryDetails || !address || !location) {
      Alert.alert('Missing Information', 'Please fill all fields and set location.');
      return;
    }

    const deliveriesRef = firebase.database().ref('deliveries');
    const newDeliveryRef = deliveriesRef.push();
    newDeliveryRef
      .set({
        deliveryDetails,
        address,
        location,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        Alert.alert('Success', 'Delivery request submitted!');
        setDeliveryDetails('');
        setAddress('');
        setLocation(null);
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Error', 'Error submitting delivery request.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Delivery Details</Text>
      <TextInput
        style={styles.input}
        placeholder="What do you want delivered?"
        value={deliveryDetails}
        onChangeText={setDeliveryDetails}
      />

      <Text style={styles.label}>Pickup Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pickup address"
        value={address}
        onChangeText={setAddress}
      />

      <Button title="Use Current Location" onPress={getLocationFromGPS} />

      <Button title="Submit Delivery" onPress={submitDelivery} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { marginTop: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 10, marginTop: 10, borderRadius: 5 },
});

export default ClientInputScreen;
