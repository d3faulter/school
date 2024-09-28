// components/MapScreen.js
import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getDatabase, ref, onValue } from 'firebase/database';

const MapScreen = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const deliveriesRef = ref(db, 'deliveries');

    const unsubscribe = onValue(deliveriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedDeliveries = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setDeliveries(formattedDeliveries);
      } else {
        setDeliveries([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const optimizeRoutes = () => {
    // Implement route optimization logic here
    Alert.alert('Routes optimized');
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            coordinate={{
              latitude: delivery.location ? delivery.location.latitude : 0,
              longitude: delivery.location ? delivery.location.longitude : 0,
            }}
            title={delivery.deliveryDetails}
            description={delivery.pickupAddress}
            onPress={() => navigation.navigate('RouteDetails', { delivery })}
          />
        ))}

        {routes.map((route, index) => (
          <Polyline
            key={index}
            coordinates={route.coordinates}
            strokeColor="#000"
            strokeWidth={3}
          />
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Optimize Routes" onPress={optimizeRoutes} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: '25%',
    right: '25%',
  },
});

export default MapScreen;