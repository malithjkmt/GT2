import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {useAuth} from '@/context/AuthContext';
import type {RootStackParamList} from '@/types';

// Auth Screens
import LoginScreen from '@/screens/Auth/LoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';

// Main Screens
import HomeScreen from '@/screens/Home/HomeScreen';
import MapScreen from '@/screens/Map/MapScreen';
import ProfileScreen from '@/screens/Profile/ProfileScreen';

// Route Screens
import AddRouteScreen from '@/screens/Routes/AddRouteScreen';
import EditRouteScreen from '@/screens/Routes/EditRouteScreen';

// Driver Screens
import DriverManagementScreen from '@/screens/Drivers/DriverManagementScreen';
import AddDriverScreen from '@/screens/Drivers/AddDriverScreen';
import EditDriverScreen from '@/screens/Drivers/EditDriverScreen';

// Truck Screens
import TruckManagementScreen from '@/screens/Trucks/TruckManagementScreen';
import AddTruckScreen from '@/screens/Trucks/AddTruckScreen';
import EditTruckScreen from '@/screens/Trucks/EditTruckScreen';

// Feedback Screens
import FeedbackScreen from '@/screens/Feedback/FeedbackScreen';
import FeedbackDetailScreen from '@/screens/Feedback/FeedbackDetailScreen';
import CreateFeedbackScreen from '@/screens/Feedback/CreateFeedbackScreen';

// Other Screens
import NotificationsScreen from '@/screens/Notifications/NotificationsScreen';
import LocationSetupScreen from '@/screens/LocationSetup/LocationSetupScreen';
import NotificationSetupScreen from '@/screens/NotificationSetup/NotificationSetupScreen';
import AdminPanelScreen from '@/screens/Admin/AdminPanelScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Feedback') {
            iconName = 'feedback';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Feedback" component={FeedbackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: 'gray',
      }}>
      <Drawer.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          drawerLabel: 'Home',
          title: 'Garbage Truck Tracker',
          drawerIcon: ({color}) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="DriverManagement"
        component={DriverManagementScreen}
        options={{
          drawerLabel: 'Manage Drivers',
          title: 'Driver Management',
          drawerIcon: ({color}) => (
            <Icon name="person" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="TruckManagement"
        component={TruckManagementScreen}
        options={{
          drawerLabel: 'Manage Trucks',
          title: 'Truck Management',
          drawerIcon: ({color}) => (
            <Icon name="local-shipping" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LocationSetup"
        component={LocationSetupScreen}
        options={{
          drawerLabel: 'Setup Location',
          title: 'Location Setup',
          drawerIcon: ({color}) => (
            <Icon name="location-on" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="NotificationSetup"
        component={NotificationSetupScreen}
        options={{
          drawerLabel: 'Notification Settings',
          title: 'Notification Setup',
          drawerIcon: ({color}) => (
            <Icon name="notifications" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AdminPanel"
        component={AdminPanelScreen}
        options={{
          drawerLabel: 'Admin Panel',
          title: 'Admin Panel',
          drawerIcon: ({color}) => (
            <Icon name="admin-panel-settings" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!user ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="AddRoute" component={AddRouteScreen} />
          <Stack.Screen name="EditRoute" component={EditRouteScreen} />
          <Stack.Screen name="AddDriver" component={AddDriverScreen} />
          <Stack.Screen name="EditDriver" component={EditDriverScreen} />
          <Stack.Screen name="AddTruck" component={AddTruckScreen} />
          <Stack.Screen name="EditTruck" component={EditTruckScreen} />
          <Stack.Screen
            name="FeedbackDetail"
            component={FeedbackDetailScreen}
          />
          <Stack.Screen
            name="CreateFeedback"
            component={CreateFeedbackScreen}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default AppNavigator;
