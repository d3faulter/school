// components/RouteDetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, update } from 'firebase/database';
import { database } from '../firebaseConfig';

const RouteDetailsScreen = ({ route, navigation }) => {
  const { delivery } = route.params;

  const acceptRoute = () => {
    if (!delivery || !delivery.id) {
      Alert.alert('Error', 'Invalid delivery data.');
      return;
    }

    const deliveryRef = ref(database, `deliveries/${delivery.id}`);
    update(deliveryRef, { status: 'accepted' })
      .then(() => {
        Alert.alert('Route Accepted', 'You have accepted this route.');
        navigation.goBack(); // Navigate back to the previous screen
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Error', 'Failed to accept the route.');
      });
  };

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No delivery data available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  details: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  detailText: { fontSize: 16, marginBottom: 5 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});

export default RouteDetailsScreen;
