import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, FAB, Card, Chip, ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {subscribeToDrivers} from '@/services/driverService';
import type {Driver} from '@/types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DriverManagementScreen: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = subscribeToDrivers(loadedDrivers => {
      setDrivers(loadedDrivers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderDriver = ({item}: {item: Driver}) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="person" size={24} color="#2196F3" />
          <Text variant="titleLarge" style={styles.name}>
            {item.name}
          </Text>
        </View>
        <Text variant="bodyMedium">License: {item.licenseNumber}</Text>
        <Text variant="bodyMedium">Phone: {item.phoneNumber}</Text>
        <Text variant="bodySmall" style={styles.nic}>
          NIC: {item.nic}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drivers}
        renderItem={renderDriver}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="person-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No drivers found</Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddDriver' as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    marginLeft: 8,
  },
  nic: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196F3',
  },
});

export default DriverManagementScreen;
