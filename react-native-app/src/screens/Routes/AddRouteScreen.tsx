import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Menu,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {createRoute} from '@/services/routeService';
import {getAvailableDrivers, subscribeToDrivers} from '@/services/driverService';
import {getAvailableTrucks, subscribeToTrucks} from '@/services/truckService';
import {getCurrentLocation, requestLocationPermission} from '@/services/geolocationService';
import {useAuth} from '@/context/AuthContext';
import type {
  RouteFormData,
  RoutePoint,
  DayOfWeek,
  Driver,
  Truck,
  RootStackParamList,
} from '@/types';

type AddRouteScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddRoute'
>;

const DAYS_OF_WEEK = Object.values(DayOfWeek);

const AddRouteScreen: React.FC = () => {
  const [routeName, setRouteName] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.MONDAY);
  const [startTime, setStartTime] = useState('');
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [waypoints, setWaypoints] = useState<RoutePoint[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markerMode, setMarkerMode] = useState<
    'start' | 'end' | 'waypoint' | null
  >(null);
  const [dayMenuVisible, setDayMenuVisible] = useState(false);

  const navigation = useNavigation<AddRouteScreenNavigationProp>();
  const {user} = useAuth();

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (selectedDay && startTime) {
      loadAvailableResources();
    }
  }, [selectedDay, startTime]);

  const initializeLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      try {
        const location = await getCurrentLocation();
        setMapRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }
  };

  const loadAvailableResources = async () => {
    try {
      const drivers = await getAvailableDrivers(selectedDay, startTime);
      const trucks = await getAvailableTrucks(selectedDay, startTime);
      setAvailableDrivers(drivers);
      setAvailableTrucks(trucks);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleMapPress = (event: any) => {
    if (!markerMode) return;

    const coordinate = event.nativeEvent.coordinate;
    const point: RoutePoint = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };

    if (markerMode === 'start') {
      setStartPoint(point);
      setMarkerMode(null);
    } else if (markerMode === 'end') {
      setEndPoint(point);
      setMarkerMode(null);
    } else if (markerMode === 'waypoint') {
      setWaypoints([...waypoints, point]);
    }
  };

  const handleSubmit = async () => {
    if (!routeName || !startPoint || !endPoint || !startTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setLoading(true);
    try {
      const routeData: RouteFormData = {
        name: routeName,
        startPoint,
        endPoint,
        waypoints,
        day: selectedDay,
        startTime,
        driverId: selectedDriver?.id,
        truckId: selectedTruck?.id,
      };

      await createRoute(routeData, user.id);
      Alert.alert('Success', 'Route created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Create New Route" />
        <Card.Content>
          <TextInput
            label="Route Name *"
            value={routeName}
            onChangeText={setRouteName}
            mode="outlined"
            style={styles.input}
          />

          <Menu
            visible={dayMenuVisible}
            onDismiss={() => setDayMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setDayMenuVisible(true)}>
                <TextInput
                  label="Day of Week *"
                  value={selectedDay}
                  mode="outlined"
                  editable={false}
                  right={<TextInput.Icon icon="chevron-down" />}
                  style={styles.input}
                />
              </TouchableOpacity>
            }>
            {DAYS_OF_WEEK.map(day => (
              <Menu.Item
                key={day}
                onPress={() => {
                  setSelectedDay(day);
                  setDayMenuVisible(false);
                }}
                title={day}
              />
            ))}
          </Menu>

          <TextInput
            label="Start Time (HH:mm) *"
            value={startTime}
            onChangeText={setStartTime}
            mode="outlined"
            placeholder="09:00"
            keyboardType="numbers-and-punctuation"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Map Locations" />
        <Card.Content>
          <View style={styles.buttonRow}>
            <Chip
              selected={markerMode === 'start'}
              onPress={() => setMarkerMode('start')}
              icon="play"
              style={styles.chip}>
              Set Start
            </Chip>
            <Chip
              selected={markerMode === 'end'}
              onPress={() => setMarkerMode('end')}
              icon="stop"
              style={styles.chip}>
              Set End
            </Chip>
            <Chip
              selected={markerMode === 'waypoint'}
              onPress={() => setMarkerMode('waypoint')}
              icon="map-marker"
              style={styles.chip}>
              Add Waypoint
            </Chip>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}>
            {startPoint && (
              <Marker coordinate={startPoint} pinColor="green" title="Start" />
            )}
            {endPoint && (
              <Marker coordinate={endPoint} pinColor="red" title="End" />
            )}
            {waypoints.map((wp, index) => (
              <Marker
                key={index}
                coordinate={wp}
                pinColor="orange"
                title={`Waypoint ${index + 1}`}
              />
            ))}
          </MapView>

          <Text style={styles.helperText}>
            Tap the chips above to activate marker mode, then tap on the map
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Assignment (Optional)" />
        <Card.Content>
          <Text variant="labelLarge" style={styles.label}>
            Available Drivers: {availableDrivers.length}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableDrivers.map(driver => (
              <Chip
                key={driver.id}
                selected={selectedDriver?.id === driver.id}
                onPress={() => setSelectedDriver(driver)}
                style={styles.chip}>
                {driver.name}
              </Chip>
            ))}
          </ScrollView>

          <Text variant="labelLarge" style={[styles.label, styles.marginTop]}>
            Available Trucks: {availableTrucks.length}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {availableTrucks.map(truck => (
              <Chip
                key={truck.id}
                selected={selectedTruck?.id === truck.id}
                onPress={() => setSelectedTruck(truck)}
                style={styles.chip}>
                {truck.model}
              </Chip>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}>
          Create Route
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.button}>
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  map: {
    height: 300,
    borderRadius: 8,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  label: {
    marginBottom: 8,
  },
  marginTop: {
    marginTop: 16,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
});

export default AddRouteScreen;
