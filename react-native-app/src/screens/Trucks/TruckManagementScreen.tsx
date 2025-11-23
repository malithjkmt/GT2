import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, FAB, Card, Chip, ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {subscribeToTrucks} from '@/services/truckService';
import type {Truck} from '@/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const TruckManagementScreen: React.FC = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = subscribeToTrucks(loadedTrucks => {
      setTrucks(loadedTrucks);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderTruck = ({item}: {item: Truck}) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="local-shipping" size={24} color="#2196F3" />
          <Text variant="titleLarge" style={styles.model}>
            {item.model}
          </Text>
          <Chip
            mode="flat"
            selected={item.onDuty}
            selectedColor={item.onDuty ? '#4CAF50' : '#9E9E9E'}>
            {item.onDuty ? 'On Duty' : 'Off Duty'}
          </Chip>
        </View>
        <Text variant="bodyMedium">License: {item.licenseNumber}</Text>
        <Text variant="bodySmall" style={styles.date}>
          Registered: {moment(item.registrationDate).format('MMM DD, YYYY')}
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
        data={trucks}
        renderItem={renderTruck}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="local-shipping" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No trucks found</Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTruck' as never)}
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
  model: {
    marginLeft: 8,
    flex: 1,
  },
  date: {
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

export default TruckManagementScreen;
