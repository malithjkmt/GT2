import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import type {Location} from '@/types';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Garbage Truck Tracker needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await Geolocation.requestAuthorization('whenInUse');
      return result === 'granted';
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.error('Error getting current location:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

export const watchLocation = (
  onLocationUpdate: (location: Location) => void,
  onError?: (error: any) => void,
): number => {
  return Geolocation.watchPosition(
    position => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    error => {
      console.error('Error watching location:', error);
      if (onError) {
        onError(error);
      }
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 5000, // Update every 5 seconds
      fastestInterval: 2000,
    },
  );
};

export const clearLocationWatch = (watchId: number): void => {
  Geolocation.clearWatch(watchId);
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const isWithinRadius = (
  center: Location,
  point: Location,
  radius: number,
): boolean => {
  const distance = calculateDistance(
    center.latitude,
    center.longitude,
    point.latitude,
    point.longitude,
  );
  return distance <= radius;
};

/**
 * Calculate Estimated Time of Arrival (SRS 3.1.2.1)
 * @param truckLocation Current location of the truck
 * @param userLocation User's location
 * @param averageSpeed Average speed in km/h (default: 30 km/h for urban areas)
 * @returns Estimated time in minutes
 */
export const calculateETA = (
  truckLocation: Location,
  userLocation: Location,
  averageSpeed: number = 30, // km/h
): number => {
  const distanceMeters = calculateDistance(
    truckLocation.latitude,
    truckLocation.longitude,
    userLocation.latitude,
    userLocation.longitude,
  );

  const distanceKm = distanceMeters / 1000;
  const timeHours = distanceKm / averageSpeed;
  const timeMinutes = Math.ceil(timeHours * 60);

  return timeMinutes;
};

/**
 * Calculate ETA considering route waypoints (more accurate)
 * @param truckLocation Current truck location
 * @param userLocation User's location
 * @param waypoints Remaining waypoints on the route
 * @param averageSpeed Average speed in km/h
 * @returns Estimated time in minutes
 */
export const calculateETAWithWaypoints = (
  truckLocation: Location,
  userLocation: Location,
  waypoints: Location[],
  averageSpeed: number = 30,
): number => {
  let totalDistance = 0;
  let currentPoint = truckLocation;

  // Find the nearest waypoint to user
  let nearestWaypointIndex = -1;
  let minDistanceToUser = Infinity;

  waypoints.forEach((waypoint, index) => {
    const dist = calculateDistance(
      waypoint.latitude,
      waypoint.longitude,
      userLocation.latitude,
      userLocation.longitude,
    );
    if (dist < minDistanceToUser) {
      minDistanceToUser = dist;
      nearestWaypointIndex = index;
    }
  });

  // Calculate distance through waypoints
  for (let i = 0; i <= nearestWaypointIndex && i < waypoints.length; i++) {
    const distance = calculateDistance(
      currentPoint.latitude,
      currentPoint.longitude,
      waypoints[i].latitude,
      waypoints[i].longitude,
    );
    totalDistance += distance;
    currentPoint = waypoints[i];
  }

  // Add final distance to user
  totalDistance += calculateDistance(
    currentPoint.latitude,
    currentPoint.longitude,
    userLocation.latitude,
    userLocation.longitude,
  );

  const distanceKm = totalDistance / 1000;
  const timeHours = distanceKm / averageSpeed;
  const timeMinutes = Math.ceil(timeHours * 60);

  return timeMinutes;
};

/**
 * Format ETA for display
 * @param minutes ETA in minutes
 * @returns Formatted string (e.g., "15 min", "1h 30min")
 */
export const formatETA = (minutes: number): string => {
  if (minutes < 0) return 'Unknown';
  if (minutes === 0) return 'Arriving now';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};
