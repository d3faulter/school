// /components/Add_edit_Car.js
import React, { useState, useEffect } from 'react';
import { Alert, Text, TextInput, View, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase, ref, update, push } from 'firebase/database';

const Add_edit_Car = ({ navigation, route }) => {
  const db = getDatabase();

  const initialState = {
    brand: '',
    model: '',
    year: '',
    licensePlate: ''
  };
  
  const Add_edit_Car = () => {
    const [newCar, setNewCar] = useState(initialState);
    const navigation = useNavigation();
    const route = useRoute();
    const db = getDatabase();
  
    const isEditCar = route.name === "Edit Car";
  
    useEffect(() => {
      if (isEditCar) {
        const car = route.params.car[1];
        setNewCar(car);
      }
      return () => {
        setNewCar(initialState);
      };
    }, []);

    const changeTextInput = (name, event) => {
      setNewCar({ ...newCar, [name]: event });
    };
  
    const handleSave = async () => {
      const { brand, model, year, licensePlate } = newCar;
  
      if (brand.length === 0 || model.length === 0 || year.length === 0 || licensePlate.length === 0) {
        return Alert.alert('Et af felterne er tomme!');
      }
  
      if (isEditCar) {
        const id = route.params.car[0];
        const carRef = ref(db, `Cars/${id}`);
        const updatedFields = { brand, model, year, licensePlate };
  
        await update(carRef, updatedFields)
          .then(() => {
            Alert.alert("Din info er nu opdateret");
            const car = newCar;
            navigation.navigate("CarDetails", { car });
          })
          .catch((error) => {
            console.error(`Error: ${error.message}`);
          });
      } else {
        const carsRef = ref(db, "/Cars/");
        const newCarData = { brand, model, year, licensePlate };
  
        await push(carsRef, newCarData)
          .then(() => {
            Alert.alert("Saved");
            setNewCar(initialState);
          })
          .catch((error) => {
            console.error(`Error: ${error.message}`);
          });
      }
    };

    return (
      <View>
        {Object.keys(initialState).map((key, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.label}>{key}</Text>
            <TextInput
              value={newCar[key]}
              onChangeText={(event) => changeTextInput(key, event)}
              style={styles.input}
            />
          </View>
        ))}
          <Pressable onPress={handleSave} style={styles.button}>
            <Text>{isEditCar ? "Save changes" : "Add car"}</Text>
          </Pressable>
      </View>
    );
  };
  

  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    label: {
      flex: 1,
      fontSize: 16,
    },
    input: {
      flex: 2,
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
    },
    button: {
      padding: 10,
      backgroundColor: '#007BFF',
      borderRadius: 5,
      alignItems: 'center',
    },
}};

export default Add_edit_Car;