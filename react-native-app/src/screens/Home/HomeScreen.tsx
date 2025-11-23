import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Chip,
  Searchbar,
  ActivityIndicator,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

import {subscribeToRoutes, activateRoute, deactivateRoute} from '@/services/routeService';
import type {Route, RootStackParamList} from '@/types';
import {useAuth} from '@/context/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {user} = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToRoutes(loadedRoutes => {
      setRoutes(loadedRoutes);
      setFilteredRoutes(loadedRoutes);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [searchQuery, routes]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleToggleActive = async (route: Route) => {
    try {
      if (route.isActive) {
        await deactivateRoute(route.id);
      } else {
        await activateRoute(route.id);
      }
    } catch (error: any) {
      console.error('Error toggling route:', error);
    }
  };

  const renderRouteCard = ({item}: {item: Route}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Map', {routeId: item.id})}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon
                name="route"
                size={24}
                color="#2196F3"
                style={styles.icon}
              />
              <Text variant="titleLarge">{item.name}</Text>
            </View>
            <Chip
              mode="flat"
              selected={item.isActive}
              selectedColor={item.isActive ? '#4CAF50' : '#9E9E9E'}
              onPress={() => handleToggleActive(item)}
              style={styles.statusChip}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Icon name="event" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.schedule.day} at {item.schedule.startTime}
            </Text>
          </View>

          {item.driverId && (
            <View style={styles.infoRow}>
              <Icon name="person" size={16} color="#666" />
              <Text style={styles.infoText}>Driver assigned</Text>
            </View>
          )}

          {item.truckId && (
            <View style={styles.infoRow}>
              <Icon name="local-shipping" size={16} color="#666" />
              <Text style={styles.infoText}>Truck assigned</Text>
            </View>
          )}

          <Text variant="bodySmall" style={styles.timestamp}>
            Created {moment(item.createdAt).fromNow()}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const isAdmin = user?.roles?.includes('admin');

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search routes"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <FlatList
          data={filteredRoutes}
          renderItem={renderRouteCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="route" size={64} color="#BDBDBD" />
              <Text variant="titleMedium" style={styles.emptyText}>
                No routes found
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Create a new route to get started
              </Text>
            </View>
          }
        />
      )}

      {isAdmin && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddRoute')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  statusChip: {
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  timestamp: {
    marginTop: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196F3',
  },
});

export default HomeScreen;
