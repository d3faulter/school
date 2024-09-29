// components/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ref, onValue, update } from 'firebase/database';
import { auth, database } from '../firebaseConfig';

const ProfileScreen = () => {
  // State variables for user preferences
  const [truckType, setTruckType] = useState('');
  const [fuelEconomy, setFuelEconomy] = useState('');
  const [cargoSpace, setCargoSpace] = useState('');
  const [drivingHours, setDrivingHours] = useState(8);
  const [sleepDuration, setSleepDuration] = useState(8);
  const [preferredCountries, setPreferredCountries] = useState('');
  
  // Loading state to manage asynchronous data fetching
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the currently authenticated user
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, 'users/' + user.uid);
      
      // Listen for changes in the user's preferences
      const unsubscribe = onValue(
        userRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setTruckType(data.truckType || '');
            setFuelEconomy(data.fuelEconomy || '');
            setCargoSpace(data.cargoSpace || '');
            setDrivingHours(data.drivingHours || 8);
            setSleepDuration(data.sleepDuration || 8);
            setPreferredCountries(
              data.preferredCountries ? data.preferredCountries.join(', ') : ''
            );
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching user preferences:', error);
          Alert.alert('Error', 'Failed to load preferences.');
          setLoading(false);
        }
      );

      // Cleanup the listener on component unmount
      return () => unsubscribe();
    } else {
      setLoading(false);
      Alert.alert('Authentication Required', 'Please log in first.');
    }
  }, []);

  // Function to save/update user preferences to Firebase
  const savePreferences = () => {
    // Validate that all required fields are filled
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
      const updatedData = {
        truckType,
        fuelEconomy,
        cargoSpace,
        drivingHours,
        sleepDuration,
        preferredCountries: preferredCountries.split(',').map(country => country.trim()),
      };
      
      // Update the user's preferences in Firebase
      update(userRef, updatedData)
        .then(() => {
          Alert.alert('Success', 'Preferences updated!');
        })
        .catch((error) => {
          console.error('Error updating preferences:', error);
          Alert.alert('Error', 'Failed to update preferences.');
        });
    } else {
      Alert.alert('Authentication Required', 'Please log in first.');
    }
  };

  // Display a loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>User Preferences</Text>

      {/* Truck Type */}
      <Text style={styles.label}>Truck Type</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter truck type"
        value={truckType}
        onChangeText={setTruckType}
      />

      {/* Fuel Economy */}
      <Text style={styles.label}>Fuel Economy (km/l)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter fuel economy"
        value={fuelEconomy}
        onChangeText={setFuelEconomy}
        keyboardType="numeric"
      />

      {/* Cargo Space */}
      <Text style={styles.label}>Cargo Space (m^3)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter cargo space"
        value={cargoSpace}
        onChangeText={setCargoSpace}
        keyboardType="numeric"
      />

      {/* Driving Hours Slider */}
      <Text style={styles.label}>Preferred Driving Hours per Day: {drivingHours}</Text>
      <Slider
        minimumValue={4}
        maximumValue={12}
        step={1}
        value={drivingHours}
        onValueChange={setDrivingHours}
        style={styles.slider}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#1EB1FC"
      />

      {/* Sleep Duration Slider */}
      <Text style={styles.label}>Sleep Duration (hours): {sleepDuration}</Text>
      <Slider
        minimumValue={4}
        maximumValue={12}
        step={1}
        value={sleepDuration}
        onValueChange={setSleepDuration}
        style={styles.slider}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#1EB1FC"
      />

      {/* Preferred Countries */}
      <Text style={styles.label}>Preferred Countries (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Germany, France"
        value={preferredCountries}
        onChangeText={setPreferredCountries}
      />

      {/* Save Preferences Button */}
      <Button title="Update Preferences" onPress={savePreferences} />
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
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
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
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
});

export default ProfileScreen;
