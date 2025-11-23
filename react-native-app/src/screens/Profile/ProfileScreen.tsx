import React from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {Card, Text, Button, List, Avatar, Divider} from 'react-native-paper';
import {useAuth} from '@/context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen: React.FC = () => {
  const {user, signOut} = useAuth();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const isAdmin = user?.roles?.includes('admin');

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user?.profile.name.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.profile.name}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
          {user?.profile.phoneNumber && (
            <Text variant="bodyMedium" style={styles.phone}>
              {user.profile.phoneNumber}
            </Text>
          )}
          {isAdmin && (
            <Text variant="labelLarge" style={styles.adminBadge}>
              Administrator
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Account Settings</List.Subheader>
            <List.Item
              title="Location Setup"
              description="Set your home location"
              left={props => <List.Icon {...props} icon="map-marker" />}
              onPress={() => navigation.navigate('LocationSetup' as never)}
            />
            <Divider />
            <List.Item
              title="Notification Settings"
              description="Configure notification preferences"
              left={props => <List.Icon {...props} icon="bell" />}
              onPress={() => navigation.navigate('NotificationSetup' as never)}
            />
            <Divider />
            <List.Item
              title="Notifications"
              description="View all notifications"
              left={props => <List.Icon {...props} icon="inbox" />}
              onPress={() => navigation.navigate('Notifications' as never)}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSignOut}
          icon="logout"
          buttonColor="#F44336"
          style={styles.signOutButton}>
          Sign Out
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    marginBottom: 4,
  },
  phone: {
    color: '#666',
  },
  adminBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: 12,
  },
  buttonContainer: {
    padding: 16,
  },
  signOutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
