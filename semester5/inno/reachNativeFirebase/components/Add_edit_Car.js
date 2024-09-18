import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View, Text, TextInput, Button } from 'react-native';
import { getDatabase, ref, child, push, update } from "firebase/database";

const Add_edit_Car = ({ navigation, route }) => {
  const db = getDatabase();

  const initialState = {
    brand: '',
    model: '',
    year: '',
    licensePlate: ''
  };

  const [newCar, setNewCar] = useState(initialState);

  const isEditCar = route.name === "Edit car";

  const changeTextInput = (name, event) => {
    setNewCar({ ...newCar, [name]: event });
  };

  const handleSave = async () => {
    console.log("handlesave called, newCar:");
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {
          Object.keys(initialState).map((key, index) => {
            return (
              <View style={styles.row} key={index}>
                <Text style={styles.label}>{key}</Text>
                <TextInput
                  value={newCar[key]}
                  onChangeText={(event) => changeTextInput(key, event)}
                  style={styles.input}
                />
              </View>
            )
          })
        }
        <Button title={isEditCar ? "Save changes" : "Add car"} onPress={() => handleSave()} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
    borderRadius: 4,
  },
};

export default Add_edit_Car;