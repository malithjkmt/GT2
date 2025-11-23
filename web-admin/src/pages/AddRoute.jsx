import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { GoogleMap, useJsApiLoader, DrawingManager, Polyline } from '@react-google-maps/api';
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS, GOOGLE_MAPS_API_KEY } from '../config/firebase';
import { useSnackbar } from 'notistack';
import { notifyDriverAboutRoute } from '../services/smsService';

const libraries = ['drawing', 'geometry'];

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 6.9271, // Colombo, Sri Lanka
  lng: 79.8612,
};

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const GARBAGE_TYPES = [
  { value: 'paper', label: 'Paper' },
  { value: 'kitchen_waste', label: 'Kitchen Waste' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'glass', label: 'Glass' },
  { value: 'metal', label: 'Metal' },
  { value: 'other', label: 'Other' },
];

export default function AddRoute() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    day: 'Monday',
    startTime: '08:00',
    estimatedDuration: 120,
    garbageTypes: [],
    driverId: '',
    truckId: '',
  });
  const [polyline, setPolyline] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Fetch drivers and trucks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const driversSnapshot = await getDocs(collection(db, COLLECTIONS.DRIVERS));
        const trucksSnapshot = await getDocs(collection(db, COLLECTIONS.TRUCKS));

        const driversData = driversSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const trucksData = trucksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDrivers(driversData);
        setTrucks(trucksData);
      } catch (error) {
        console.error('Error fetching drivers/trucks:', error);
        enqueueSnackbar('Failed to load drivers and trucks', { variant: 'error' });
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  // Filter available drivers and trucks based on busy hours
  useEffect(() => {
    if (!formData.day || !formData.startTime) {
      setAvailableDrivers(drivers);
      setAvailableTrucks(trucks);
      return;
    }

    const selectedDay = formData.day;
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = startTimeMinutes + (formData.estimatedDuration || 0);

    // Check if driver/truck is available during the route time
    const isAvailable = (busyHours) => {
      if (!busyHours || busyHours.length === 0) return true;

      return !busyHours.some(bh => {
        if (bh.day !== selectedDay) return false;

        const [bhStartHour, bhStartMinute] = bh.startTime.split(':').map(Number);
        const [bhEndHour, bhEndMinute] = bh.endTime.split(':').map(Number);
        const bhStartMinutes = bhStartHour * 60 + bhStartMinute;
        const bhEndMinutes = bhEndHour * 60 + bhEndMinute;

        // Check if times overlap
        return !(endTimeMinutes <= bhStartMinutes || startTimeMinutes >= bhEndMinutes);
      });
    };

    setAvailableDrivers(drivers.filter(d => isAvailable(d.busyHours)));
    setAvailableTrucks(trucks.filter(t => isAvailable(t.busyHours) && t.onDuty));
  }, [formData.day, formData.startTime, formData.estimatedDuration, drivers, trucks]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGarbageTypeToggle = (type) => {
    setFormData(prev => {
      const types = prev.garbageTypes.includes(type)
        ? prev.garbageTypes.filter(t => t !== type)
        : [...prev.garbageTypes, type];
      return { ...prev, garbageTypes: types };
    });
  };

  const onPolylineComplete = useCallback((poly) => {
    const path = poly.getPath();
    const coordinates = [];

    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({
        latitude: point.lat(),
        longitude: point.lng(),
      });
    }

    setRoutePath(coordinates);
    setPolyline(poly);

    // Remove the drawing from the map (we'll display it as a controlled Polyline)
    poly.setMap(null);

    enqueueSnackbar(`Route drawn with ${coordinates.length} points`, { variant: 'success' });
  }, [enqueueSnackbar]);

  const clearRoute = () => {
    setRoutePath([]);
    setPolyline(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      enqueueSnackbar('Please enter a route name', { variant: 'error' });
      return;
    }

    if (routePath.length < 2) {
      enqueueSnackbar('Please draw a route on the map', { variant: 'error' });
      return;
    }

    if (formData.garbageTypes.length === 0) {
      enqueueSnackbar('Please select at least one garbage type', { variant: 'error' });
      return;
    }

    setLoading(true);

    try {
      const routeData = {
        name: formData.name,
        startPoint: {
          latitude: routePath[0].latitude,
          longitude: routePath[0].longitude,
        },
        endPoint: {
          latitude: routePath[routePath.length - 1].latitude,
          longitude: routePath[routePath.length - 1].longitude,
        },
        waypoints: routePath.slice(1, -1), // All points except first and last
        schedule: {
          day: formData.day,
          startTime: formData.startTime,
          estimatedDuration: formData.estimatedDuration,
          garbageTypes: formData.garbageTypes,
        },
        driverId: formData.driverId || null,
        truckId: formData.truckId || null,
        isActive: false, // Routes start as inactive (SRS 3.1.1.1.5)
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin', // In production, use actual admin user ID
      };

      await addDoc(collection(db, COLLECTIONS.ROUTES), routeData);

      enqueueSnackbar('Route created successfully!', { variant: 'success' });

      // SRS 3.1.1.1.5: 10-minute delay before notifications
      // This will be handled by a Cloud Function or background service

      // SRS 3.1.1.1.6: Send SMS to driver if assigned
      if (formData.driverId) {
        try {
          const driverDoc = await getDoc(doc(db, COLLECTIONS.DRIVERS, formData.driverId));
          if (driverDoc.exists()) {
            const driver = driverDoc.data();
            await notifyDriverAboutRoute(driver, routeData);
            enqueueSnackbar('SMS notification sent to driver', { variant: 'info' });
          }
        } catch (smsError) {
          console.error('Error sending SMS to driver:', smsError);
          // Don't fail the route creation if SMS fails
        }
      }

      navigate('/routes');
    } catch (error) {
      console.error('Error creating route:', error);
      enqueueSnackbar('Failed to create route', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return (
      <Box>
        <Alert severity="error">Error loading Google Maps</Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Add New Route
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Map Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Draw Route on Map
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use the drawing tools to draw the route path. Click to add points along the route.
              </Typography>

              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
                options={{
                  mapTypeControl: true,
                  streetViewControl: false,
                }}
              >
                {routePath.length === 0 && (
                  <DrawingManager
                    onPolylineComplete={onPolylineComplete}
                    options={{
                      drawingControl: true,
                      drawingControlOptions: {
                        position: window.google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: [window.google.maps.drawing.OverlayType.POLYLINE],
                      },
                      polylineOptions: {
                        strokeColor: '#2196F3',
                        strokeOpacity: 0.8,
                        strokeWeight: 3,
                        clickable: false,
                        editable: true,
                        zIndex: 1,
                      },
                    }}
                  />
                )}

                {routePath.length > 0 && (
                  <Polyline
                    path={routePath.map(p => ({ lat: p.latitude, lng: p.longitude }))}
                    options={{
                      strokeColor: '#2196F3',
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                    }}
                  />
                )}
              </GoogleMap>

              {routePath.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="error" onClick={clearRoute}>
                    Clear Route
                  </Button>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Route points: {routePath.length}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Route Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Route Details
              </Typography>

              <TextField
                fullWidth
                label="Route Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                  label="Day of Week"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type="number"
                label="Estimated Duration (minutes)"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ mb: 2 }}
              />
            </Paper>
          </Grid>

          {/* Garbage Types */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Garbage Types (SRS 3.1.1.1.5)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the types of garbage collected on this route
              </Typography>

              <FormGroup>
                {GARBAGE_TYPES.map(type => (
                  <FormControlLabel
                    key={type.value}
                    control={
                      <Checkbox
                        checked={formData.garbageTypes.includes(type.value)}
                        onChange={() => handleGarbageTypeToggle(type.value)}
                      />
                    }
                    label={type.label}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Grid>

          {/* Driver and Truck Assignment */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assign Driver (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Only showing available drivers for {formData.day} at {formData.startTime}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={formData.driverId}
                  onChange={(e) => handleInputChange('driverId', e.target.value)}
                  label="Driver"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {availableDrivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name} (Emp: {driver.employeeNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {availableDrivers.length === 0 && drivers.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No drivers available for this schedule
                </Alert>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assign Truck (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Only showing available on-duty trucks for {formData.day} at {formData.startTime}
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Truck</InputLabel>
                <Select
                  value={formData.truckId}
                  onChange={(e) => handleInputChange('truckId', e.target.value)}
                  label="Truck"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {availableTrucks.map(truck => (
                    <MenuItem key={truck.id} value={truck.id}>
                      {truck.model} ({truck.licenseNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {availableTrucks.length === 0 && trucks.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No trucks available for this schedule
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Submit Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/routes')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Route'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
