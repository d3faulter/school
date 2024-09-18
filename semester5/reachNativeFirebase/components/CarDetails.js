import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet, Platform } from 'react-native';
import { getDatabase, ref, remove } from 'firebase/database';

const CarDetails = ({ navigation, route }) => {
  const [car, setCar] = useState({});

  useEffect(() => {
    setCar(route.params.car[1]);
    return () => {
      setCar({});
    };
  }, []);

  const handleEdit = () => {
    // Vi navigerer videre til EditCar skærmen og sender bilen videre med
    const car = route.params.car;
    navigation.navigate('Edit Car', { car });
  };

  const confirmDelete = () => {
    /*Er det mobile?*/
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Alert.alert('Are you sure?', 'Do you want to delete the car?', [
        { text: 'Cancel', style: 'cancel' },
        // Vi bruger handleDelete som eventHandler til onPress
        { text: 'Delete', style: 'destructive', onPress: () => handleDelete() },
      ]);
    }
  };

  const handleDelete = async () => {
    const id = route.params.car[0];
    const db = getDatabase();
    // Define the path to the specific car node you want to remove
    const carRef = ref(db, `Cars/${id}`);

    // Use the 'remove' function to delete the car node
    await remove(carRef)
      .then(() => {
        navigation.goBack();
      })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };

  if (!car) {
    return <Text>No data</Text>;
  }

  return (
    <View style={styles.container}>
      {Object.entries(car).map((item, index) => {
        return (
          <View style={styles.row} key={index}>
            {/*Vores car keys navn*/}
            <Text style={styles.label}>{item[0]} </Text>
            {/*Vores car values navne */}
            <Text style={styles.value}>{item[1]}</Text>
          </View>
        );
      })}
      <Button title="Edit" onPress={handleEdit} />
      <Button title="Delete" onPress={confirmDelete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  value: {
    flex: 1,
  },
});

export default CarDetails;