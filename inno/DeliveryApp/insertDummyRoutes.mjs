// insertDummyRoutes.mjs
import { database } from './firebaseConfig.js';
import { ref, set } from 'firebase/database';

const dummyRoutes = [
  {
    id: 'route1',
    title: 'Route 1',
    coordinates: [
      { latitude: 55.683806, longitude: 12.55681 },
      { latitude: 56.42916207638186, longitude: 10.659273148086726 },
      { latitude: 55.168608944139535, longitude: 9.05652064173978 },
      { latitude: 55.19622278668399, longitude: 10.571164602114955 },
    ],
  },
  {
    id: 'route2',
    title: 'Route 2',
    coordinates: [
      { latitude: 56.29989112936508, longitude: 8.824695587197594 },
      { latitude: 57.22865490758077, longitude: 10.075345105787665 },
      { latitude: 55.100996619033474, longitude: 9.805752426535127 },
      { latitude: 53.63469575966881, longitude: 53.63469575966881 },
    ],
  },
  // Add more routes as needed
];

const insertDummyRoutes = async () => {
  const routesRef = ref(database, 'routes');
  for (const route of dummyRoutes) {
    await set(ref(database, `routes/${route.id}`), {
      title: route.title,
      coordinates: route.coordinates,
    });
  }
  console.log('Dummy routes inserted');
};

insertDummyRoutes();