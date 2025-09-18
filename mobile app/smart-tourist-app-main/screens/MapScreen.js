// screens/MapScreen.js
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { apiRequest } from "../services/api";

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch geofences from backend
  const fetchGeofences = async () => {
    try {
      const response = await apiRequest("/geofences");
      if (response.success) {
        setGeofences(response.data);
      }
    } catch (err) {
      console.log("Failed to fetch geofences");
    }
  };

  // Haversine formula to calculate distance
  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // Check geofence breach
  const checkGeofenceBreach = async (userCoords, fences) => {
    for (const fence of fences) {
      const lat = fence.location.coordinates[1];
      const lng = fence.location.coordinates[0];
      const distance = getDistanceFromLatLonInMeters(
        userCoords.latitude,
        userCoords.longitude,
        lat,
        lng
      );

      if (distance <= fence.radius && fence.dangerLevel === "danger") {
        Alert.alert(
          "⚠️ Danger Zone",
          "You have entered a restricted/dangerous area!"
        );

        // Notify backend
        await apiRequest("/incidents", "POST", {
          type: "Geofence Breach",
          fenceId: fence._id,
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
        });
      }
    }
  };

  // Location + geofence logic
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Fetch geofences initially
      fetchGeofences();

      // Watch user location
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        async (loc) => {
          setLocation(loc);

          const { latitude, longitude } = loc.coords;

          // Send location to backend
          await apiRequest("/location/update", "POST", {
            latitude,
            longitude,
          });

          // Check geofences
          checkGeofenceBreach({ latitude, longitude }, geofences);
        }
      );

      return () => {
        subscription.remove();
      };
    })();
  }, [geofences]);

  if (!location) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Marker for user */}
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
        />

        {/* Render geofences */}
        {geofences.map((fence) => (
          <Circle
            key={fence._id}
            center={{
              latitude: fence.location.coordinates[1],
              longitude: fence.location.coordinates[0],
            }}
            radius={fence.radius}
            strokeColor={fence.dangerLevel === "danger" ? "red" : "green"}
            fillColor={
              fence.dangerLevel === "danger"
                ? "rgba(255,0,0,0.2)"
                : "rgba(0,255,0,0.2)"
            }
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});
