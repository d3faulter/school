// components/TruckerInputScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider'; // Already installed
import { ref, set } from 'firebase/database';
import { auth, database } from '../firebaseConfig';

const TruckerInputScreen = () => {
  const [truckType, setTruckType] = useState('');
  const [fuelEconomy, setFuelEconomy] = useState('');
  const [cargoSpace, setCargoSpace] = useState('');
  const [drivingHours, setDrivingHours] = useState(8);
  const [sleepDuration, setSleepDuration] = useState(8);
  const [preferredCountries, setPreferredCountries] = useState('');

  const savePreferences = () => {
    if (
      !truckType ||
      !fuelEconomy ||
      !cargoSpace ||
      !preferredCountries
    ) {
      Alert.alert('Missing Information', 'Please fill all fields.');
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, 'users/' + user.uid);
      set(userRef, {
        truckType,
        fuelEconomy,
        cargoSpace,
        drivingHours,
        sleepDuration,
        preferredCountries: preferredCountries.split(',').map(country => country.trim()), // Assuming input is comma-separated
      })
        .then(() => {
          Alert.alert('Success', 'Preferences saved!');
        })
        .catch((error) => {
          console.error(error);
          Alert.alert('Error', 'Error saving preferences.');
        });
    } else {
      Alert.alert('Authentication Required', 'Please log in first.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Truck Type</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter truck type"
        value={truckType}
        onChangeText={setTruckType}
      />

      <Text style={styles.label}>Fuel Economy (km/l)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter fuel economy"
        value={fuelEconomy}
        onChangeText={setFuelEconomy}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Cargo Space (m³)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter cargo space"
        value={cargoSpace}
        onChangeText={setCargoSpace}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Preferred Driving Hours per Day: {drivingHours}</Text>
      <Slider
        minimumValue={4}
        maximumValue={12}
        step={1}
        value={drivingHours}
        onValueChange={setDrivingHours}
      />

      <Text style={styles.label}>Sleep Duration (hours): {sleepDuration}</Text>
      <Slider
        minimumValue={4}
        maximumValue={12}
        step={1}
        value={sleepDuration}
        onValueChange={setSleepDuration}
      />

      <Text style={styles.label}>Preferred Countries (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Germany, France"
        value={preferredCountries}
        onChangeText={setPreferredCountries}
      />

      <Button title="Save Preferences" onPress={savePreferences} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { marginTop: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 10, marginTop: 10, borderRadius: 5 },
});

export default TruckerInputScreen;
