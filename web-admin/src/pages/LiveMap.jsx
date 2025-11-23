import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, COLLECTIONS, GOOGLE_MAPS_API_KEY } from '../config/firebase';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const libraries = ['geometry'];

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
  minHeight: '600px',
};

const center = {
  lat: 6.9271, // Colombo, Sri Lanka
  lng: 79.8612,
};

export default function LiveMap() {
  const [trucks, setTrucks] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Real-time subscription to trucks
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.TRUCKS),
      (snapshot) => {
        const trucksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrucks(trucksData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching trucks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time subscription to active routes
  useEffect(() => {
    const q = selectedRouteId === 'all'
      ? collection(db, COLLECTIONS.ROUTES)
      : query(collection(db, COLLECTIONS.ROUTES), where('id', '==', selectedRouteId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const routesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(routesData);
      },
      (error) => {
        console.error('Error fetching routes:', error);
      }
    );

    return () => unsubscribe();
  }, [selectedRouteId]);

  const handleTruckClick = useCallback((truck) => {
    setSelectedTruck(truck);
    setSelectedRoute(null);
  }, []);

  const handleRouteClick = useCallback((route) => {
    setSelectedRoute(route);
    setSelectedTruck(null);
  }, []);

  const getMarkerIcon = (truck) => {
    // Different colors for on-duty vs off-duty trucks (SRS 3.1.1.2)
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: truck.onDuty ? '#4CAF50' : '#757575',
      fillOpacity: 0.8,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 10,
    };
  };

  const getRoutePolyline = (route) => {
    if (!route.startPoint || !route.endPoint) return [];

    const path = [
      { lat: route.startPoint.latitude, lng: route.startPoint.longitude },
      ...(route.waypoints || []).map(wp => ({ lat: wp.latitude, lng: wp.longitude })),
      { lat: route.endPoint.latitude, lng: route.endPoint.longitude },
    ];

    return path;
  };

  if (loadError) {
    return (
      <Box>
        <Alert severity="error">Error loading Google Maps</Alert>
      </Box>
    );
  }

  if (!isLoaded || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredTrucks = selectedRouteId === 'all'
    ? trucks
    : trucks.filter(t => {
        const route = routes.find(r => r.truckId === t.id);
        return route?.id === selectedRouteId;
      });

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Live Fleet Map
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Filter by Route</InputLabel>
          <Select
            value={selectedRouteId}
            onChange={(e) => setSelectedRouteId(e.target.value)}
            label="Filter by Route"
          >
            <MenuItem value="all">All Routes</MenuItem>
            {routes.map(route => (
              <MenuItem key={route.id} value={route.id}>
                {route.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            icon={<LocalShippingIcon />}
            label={`On Duty: ${trucks.filter(t => t.onDuty).length}`}
            color="success"
            size="small"
          />
          <Chip
            icon={<LocalShippingIcon />}
            label={`Off Duty: ${trucks.filter(t => !t.onDuty).length}`}
            color="default"
            size="small"
          />
        </Box>
      </Box>

      <Paper>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          options={{
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          }}
        >
          {/* Render routes as polylines */}
          {routes
            .filter(r => selectedRouteId === 'all' || r.id === selectedRouteId)
            .map((route) => (
              <Polyline
                key={route.id}
                path={getRoutePolyline(route)}
                options={{
                  strokeColor: route.isActive ? '#2196F3' : '#9E9E9E',
                  strokeOpacity: 0.7,
                  strokeWeight: 4,
                  clickable: true,
                }}
                onClick={() => handleRouteClick(route)}
              />
            ))}

          {/* Render truck markers with real-time locations */}
          {filteredTrucks
            .filter(truck => truck.location?.latitude && truck.location?.longitude)
            .map((truck) => (
              <Marker
                key={truck.id}
                position={{
                  lat: truck.location.latitude,
                  lng: truck.location.longitude,
                }}
                icon={getMarkerIcon(truck)}
                onClick={() => handleTruckClick(truck)}
              />
            ))}

          {/* Info Window for selected truck (SRS 3.1.1.2) */}
          {selectedTruck && selectedTruck.location && (
            <InfoWindow
              position={{
                lat: selectedTruck.location.latitude,
                lng: selectedTruck.location.longitude,
              }}
              onCloseClick={() => setSelectedTruck(null)}
            >
              <Box sx={{ p: 1, minWidth: '200px' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedTruck.model}
                </Typography>
                <Typography variant="body2">
                  <strong>License:</strong> {selectedTruck.licenseNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={selectedTruck.onDuty ? 'On Duty' : 'Off Duty'}
                    color={selectedTruck.onDuty ? 'success' : 'default'}
                    size="small"
                  />
                </Typography>
                {selectedTruck.location?.address && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Location:</strong> {selectedTruck.location.address}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Last updated: {selectedTruck.updatedAt?.toDate
                    ? selectedTruck.updatedAt.toDate().toLocaleString()
                    : 'Unknown'}
                </Typography>
              </Box>
            </InfoWindow>
          )}

          {/* Info Window for selected route */}
          {selectedRoute && selectedRoute.startPoint && (
            <InfoWindow
              position={{
                lat: selectedRoute.startPoint.latitude,
                lng: selectedRoute.startPoint.longitude,
              }}
              onCloseClick={() => setSelectedRoute(null)}
            >
              <Box sx={{ p: 1, minWidth: '250px' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedRoute.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Day:</strong> {selectedRoute.schedule?.day}
                </Typography>
                <Typography variant="body2">
                  <strong>Start Time:</strong> {selectedRoute.schedule?.startTime}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {selectedRoute.schedule?.estimatedDuration} min
                </Typography>
                {selectedRoute.schedule?.garbageTypes?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Garbage Types:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {selectedRoute.schedule.garbageTypes.map(type => (
                        <Chip
                          key={type}
                          label={type.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={selectedRoute.isActive ? 'Active' : 'Inactive'}
                    color={selectedRoute.isActive ? 'primary' : 'default'}
                    size="small"
                  />
                </Typography>
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>
      </Paper>

      {filteredTrucks.filter(t => t.location).length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No trucks with location data found. Trucks will appear on the map once they start broadcasting their location.
        </Alert>
      )}
    </Box>
  );
}
