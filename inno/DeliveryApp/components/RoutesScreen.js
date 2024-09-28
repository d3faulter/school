// components/RoutesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Picker } from '@react-native-picker/picker';

const RoutesScreen = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const routesRef = ref(db, 'routes');

    const unsubscribe = onValue(routesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedRoutes = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setRoutes(fetchedRoutes);
      } else {
        setRoutes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRouteSelect = (routeId) => {
    const route = routes.find((r) => r.id === routeId);
    setSelectedRoute(route);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      {dropdownVisible && (
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Select a Route:</Text>
          <Picker
            selectedValue={selectedRoute ? selectedRoute.id : ''}
            onValueChange={(itemValue) => handleRouteSelect(itemValue)}
          >
            <Picker.Item label="Select a route" value="" />
            {routes.map((route) => (
              <Picker.Item key={route.id} label={route.title} value={route.id} />
            ))}
          </Picker>
        </View>
      )}
      <MapView style={styles.map}>
        {selectedRoute && (
          <Polyline
            coordinates={selectedRoute.coordinates}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
      </MapView>
      {selectedRoute && (
        <View style={styles.buttonContainer}>
          <Button title="Change Route" onPress={() => setDropdownVisible(true)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  dropdownContainer: { padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 10 },
  map: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: '25%',
    right: '25%',
  },
});

export default RoutesScreen;