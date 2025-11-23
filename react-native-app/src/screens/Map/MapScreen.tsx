import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {ActivityIndicator, FAB, Portal, Modal, Text} from 'react-native-paper';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';

import {GOOGLE_MAPS_API_KEY} from '@/config/firebase';
import {subscribeToActiveRoutes, getRoute} from '@/services/routeService';
import {subscribeToTrucks} from '@/services/truckService';
import {getCurrentLocation, requestLocationPermission} from '@/services/geolocationService';
import type {Route, Truck, Location, RootStackParamList} from '@/types';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const MapScreen: React.FC = () => {
  const [activeRoutes, setActiveRoutes] = useState<Route[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const mapRef = useRef<MapView>(null);
  const route = useRoute<MapScreenRouteProp>();
  const routeId = route.params?.routeId;

  useEffect(() => {
    const initializeMap = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        try {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
        } catch (error) {
          console.error('Error getting current location:', error);
        }
      }
    };

    initializeMap();

    const unsubscribeRoutes = subscribeToActiveRoutes(routes => {
      setActiveRoutes(routes);
      setLoading(false);
    });

    const unsubscribeTrucks = subscribeToTrucks(loadedTrucks => {
      setTrucks(loadedTrucks.filter(t => t.onDuty && t.location));
    });

    return () => {
      unsubscribeRoutes();
      unsubscribeTrucks();
    };
  }, []);

  useEffect(() => {
    if (routeId) {
      loadSpecificRoute(routeId);
    }
  }, [routeId]);

  const loadSpecificRoute = async (id: string) => {
    try {
      const routeData = await getRoute(id);
      if (routeData) {
        setSelectedRoute(routeData);
        focusOnRoute(routeData);
      }
    } catch (error) {
      console.error('Error loading route:', error);
    }
  };

  const focusOnRoute = (routeData: Route) => {
    if (mapRef.current && routeData.startPoint && routeData.endPoint) {
      const coordinates = [
        routeData.startPoint,
        ...routeData.waypoints,
        routeData.endPoint,
      ];

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  };

  const focusOnMyLocation = async () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const renderRouteDirections = (routeData: Route) => {
    if (!routeData.startPoint || !routeData.endPoint) {
      return null;
    }

    const waypoints = routeData.waypoints.map(wp => ({
      latitude: wp.latitude,
      longitude: wp.longitude,
    }));

    return (
      <MapViewDirections
        origin={routeData.startPoint}
        destination={routeData.endPoint}
        waypoints={waypoints}
        apikey={GOOGLE_MAPS_API_KEY}
        strokeWidth={4}
        strokeColor="#2196F3"
        onError={error => {
          console.error('Directions error:', error);
        }}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 6.9271,
        longitude: 79.8612,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        {/* Render active route directions */}
        {selectedRoute && renderRouteDirections(selectedRoute)}

        {/* Render all active routes if no specific route selected */}
        {!selectedRoute &&
          activeRoutes.map(r => (
            <React.Fragment key={r.id}>
              {renderRouteDirections(r)}
              <Marker
                coordinate={r.startPoint}
                title={`${r.name} - Start`}
                pinColor="green"
              />
              <Marker
                coordinate={r.endPoint}
                title={`${r.name} - End`}
                pinColor="red"
              />
            </React.Fragment>
          ))}

        {/* Render truck locations */}
        {trucks.map(truck => (
          truck.location && (
            <Marker
              key={truck.id}
              coordinate={truck.location}
              title={truck.model}
              description={`License: ${truck.licenseNumber}`}>
              <View style={styles.truckMarker}>
                <Text style={styles.truckMarkerText}>🚛</Text>
              </View>
            </Marker>
          )
        ))}

        {/* Render waypoints for selected route */}
        {selectedRoute &&
          selectedRoute.waypoints.map((waypoint, index) => (
            <Marker
              key={`waypoint-${index}`}
              coordinate={waypoint}
              title={`Waypoint ${index + 1}`}
              pinColor="orange"
            />
          ))}
      </MapView>

      <FAB
        icon="crosshairs-gps"
        style={styles.fabLocation}
        onPress={focusOnMyLocation}
        small
      />

      {selectedRoute && (
        <FAB
          icon="map"
          label="View All Routes"
          style={styles.fabRoutes}
          onPress={() => setSelectedRoute(null)}
          small
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLocation: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#FFFFFF',
  },
  fabRoutes: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#2196F3',
  },
  truckMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    elevation: 4,
  },
  truckMarkerText: {
    fontSize: 24,
  },
});

export default MapScreen;
