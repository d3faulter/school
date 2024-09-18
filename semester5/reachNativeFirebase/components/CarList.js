import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const CarList = ({ navigation }) => {
  const [cars, setCars] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const carsRef = ref(db, "Cars");

    // Use the 'onValue' function to listen for changes in the 'Cars' node
    onValue(carsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // If data exists, set it in the 'cars' state
        setCars(data);
      }
    });

    // Clean up the listener when the component unmounts
    return () => {
      // Unsubscribe the listener
      off(carsRef);
    };
  }, []); // The empty dependency array means this effect runs only once

  // Vi viser ingenting hvis der ikke er data
  if (!cars) {
    return <Text>Loading...</Text>;
  }

  const handleSelectCar = id => {
    /*Her søger vi direkte i vores array af biler og finder bil objektet som matcher idet vi har tilsendt*/
    const car = Object.entries(cars).find(car => car[0] === id /*id*/);
    navigation.navigate('CarDetails', { car });
  };

  // Flatlist forventer et array. Derfor tager vi alle values fra vores cars objekt, og bruger som array til listen
  const carArray = Object.values(cars);
  const carKeys = Object.keys(cars);

  return (
    <FlatList
      data={carArray}
      // Vi bruger carKeys til at finde ID på den aktuelle bil og returnerer dette som key, og giver det med som ID til CarListItem
      keyExtractor={(item, index) => carKeys[index]}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity style={styles.container} onPress={() => handleSelectCar(carKeys[index])}>
            <Text style={styles.text}>
              {item.brand} {item.model}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default CarList;