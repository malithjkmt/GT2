import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  TextInput,
  Switch,
  List,
  IconButton,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import { Firestore } from '@react-native-firebase/firestore';
import { Collections } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { Route, NotificationProfile } from '../../types';

// SRS 3.1.2.2: Custom notification profiles for townspeople
export default function NotificationSetupScreen() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [profiles, setProfiles] = useState<NotificationProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // New profile form
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [advanceTime, setAdvanceTime] = useState('15');
  const [notificationMethod, setNotificationMethod] = useState<'push' | 'sms' | 'both'>('push');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load active routes
      const routesSnapshot = await Firestore()
        .collection(Collections.ROUTES)
        .where('isActive', '==', true)
        .get();

      const routesData = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Route[];

      setRoutes(routesData);

      // Load user's notification profiles
      if (user) {
        const userDoc = await Firestore()
          .collection(Collections.USERS)
          .doc(user.id)
          .get();

        const userData = userDoc.data();
        setProfiles(userData?.profile?.notificationProfiles || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load notification settings');
    }
  };

  const handleToggleRoute = (routeId: string) => {
    setSelectedRoutes(prev =>
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleSaveProfile = async () => {
    if (selectedRoutes.length === 0) {
      Alert.alert('Error', 'Please select at least one route to track');
      return;
    }

    const advanceTimeNum = parseInt(advanceTime);
    if (isNaN(advanceTimeNum) || advanceTimeNum < 0) {
      Alert.alert('Error', 'Please enter a valid advance time in minutes');
      return;
    }

    setLoading(true);

    try {
      const newProfile: NotificationProfile = {
        id: Date.now().toString(),
        routeIds: selectedRoutes,
        advanceTime: advanceTimeNum,
        enabled,
        notificationMethod,
        createdAt: new Date(),
      };

      const updatedProfiles = [...profiles, newProfile];

      await Firestore()
        .collection(Collections.USERS)
        .doc(user?.id)
        .update({
          'profile.notificationProfiles': updatedProfiles,
        });

      setProfiles(updatedProfiles);

      // Reset form
      setSelectedRoutes([]);
      setAdvanceTime('15');
      setNotificationMethod('push');
      setEnabled(true);

      Alert.alert('Success', 'Notification profile created successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save notification profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete this notification profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedProfiles = profiles.filter(p => p.id !== profileId);

              await Firestore()
                .collection(Collections.USERS)
                .doc(user?.id)
                .update({
                  'profile.notificationProfiles': updatedProfiles,
                });

              setProfiles(updatedProfiles);
              Alert.alert('Success', 'Profile deleted');
            } catch (error) {
              console.error('Error deleting profile:', error);
              Alert.alert('Error', 'Failed to delete profile');
            }
          },
        },
      ]
    );
  };

  const handleToggleProfile = async (profileId: string) => {
    try {
      const updatedProfiles = profiles.map(p =>
        p.id === profileId ? { ...p, enabled: !p.enabled } : p
      );

      await Firestore()
        .collection(Collections.USERS)
        .doc(user?.id)
        .update({
          'profile.notificationProfiles': updatedProfiles,
        });

      setProfiles(updatedProfiles);
    } catch (error) {
      console.error('Error toggling profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Notification Profiles (SRS 3.1.2.2)" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            Set up custom notifications to know when garbage trucks are approaching your location.
          </Text>

          {profiles.length > 0 && (
            <>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Your Profiles
              </Text>
              {profiles.map(profile => {
                const routeNames = routes
                  .filter(r => profile.routeIds.includes(r.id))
                  .map(r => r.name)
                  .join(', ');

                return (
                  <Card key={profile.id} style={styles.profileCard}>
                    <Card.Content>
                      <View style={styles.profileHeader}>
                        <View style={{ flex: 1 }}>
                          <Text variant="titleSmall">{routeNames || 'Unknown Routes'}</Text>
                          <Text variant="bodySmall" style={styles.profileDetail}>
                            Notify {profile.advanceTime} min before arrival
                          </Text>
                          <View style={styles.chipContainer}>
                            <Chip
                              mode="outlined"
                              compact
                              style={styles.chip}
                            >
                              {profile.notificationMethod.toUpperCase()}
                            </Chip>
                          </View>
                        </View>
                        <View style={styles.profileActions}>
                          <Switch
                            value={profile.enabled}
                            onValueChange={() => handleToggleProfile(profile.id)}
                          />
                          <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteProfile(profile.id)}
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                );
              })}
              <Divider style={styles.divider} />
            </>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Create New Profile
          </Text>

          <Text variant="bodyMedium" style={styles.label}>
            Select Routes to Track:
          </Text>
          {routes.map(route => (
            <List.Item
              key={route.id}
              title={route.name}
              description={`${route.schedule.day} at ${route.schedule.startTime}`}
              left={() => (
                <Switch
                  value={selectedRoutes.includes(route.id)}
                  onValueChange={() => handleToggleRoute(route.id)}
                />
              )}
            />
          ))}

          <TextInput
            label="Advance Notification Time (minutes)"
            value={advanceTime}
            onChangeText={setAdvanceTime}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            helperText="How many minutes before the truck arrives should you be notified?"
          />

          <Text variant="bodyMedium" style={styles.label}>
            Notification Method:
          </Text>
          <SegmentedButtons
            value={notificationMethod}
            onValueChange={(value) => setNotificationMethod(value as any)}
            buttons={[
              { value: 'push', label: 'Push' },
              { value: 'sms', label: 'SMS' },
              { value: 'both', label: 'Both' },
            ]}
            style={styles.input}
          />

          <View style={styles.switchContainer}>
            <Text variant="bodyMedium">Enable this profile</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSaveProfile}
            loading={loading}
            disabled={loading || selectedRoutes.length === 0}
            style={styles.saveButton}
          >
            Save Profile
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  profileCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileDetail: {
    color: '#666',
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 4,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    marginTop: 24,
  },
});
