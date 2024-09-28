// components/RouteDetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const RouteDetailsScreen = ({ route, navigation }) => {
  const { delivery } = route.params;

  const acceptRoute = () => {
    // Implement actual logic to accept the route
    Alert.alert('Route Accepted', 'You have accepted this route.');
    // Optionally, navigate back or update delivery status in Firebase
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {/* Display pickup location */}
        <Marker
          coordinate={{
            latitude: delivery.location ? delivery.location.latitude : 0,
            longitude: delivery.location ? delivery.location.longitude : 0,
          }}
          title={delivery.deliveryDetails}
          description={delivery.address}
        />
        {/* You can add more markers or polylines as needed */}
      </MapView>
      <View style={styles.details}>
        <Text style={styles.title}>Route Details</Text>
        <Text style={styles.detailText}>Delivery Details: {delivery.deliveryDetails}</Text>
        <Text style={styles.detailText}>Pickup Address: {delivery.address}</Text>
        {/* Add more details as needed */}
        <Button title="Accept Route" onPress={acceptRoute} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  details: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  detailText: { fontSize: 16, marginBottom: 5 },
});

export default RouteDetailsScreen;
