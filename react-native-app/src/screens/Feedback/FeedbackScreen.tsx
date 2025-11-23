import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {Text, FAB, Card, Chip, ActivityIndicator} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {subscribeToUserFeedback} from '@/services/feedbackService';
import {useAuth} from '@/context/AuthContext';
import type {Feedback} from '@/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const FeedbackScreen: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {user} = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserFeedback(user.id, loadedFeedback => {
      setFeedbackList(loadedFeedback);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderFeedback = ({item}: {item: Feedback}) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('FeedbackDetail' as never, {feedbackId: item.id} as never)}>
      <Card.Content>
        <View style={styles.header}>
          <Icon name="feedback" size={20} color="#2196F3" />
          <Text variant="titleMedium" style={styles.subject}>
            {item.subject}
          </Text>
        </View>
        <Chip
          mode="flat"
          selectedColor={
            item.status === 'resolved' ? '#4CAF50' : '#FF9800'
          }
          style={styles.statusChip}>
          {item.status}
        </Chip>
        <Text variant="bodySmall" numberOfLines={2} style={styles.message}>
          {item.messages[item.messages.length - 1]?.message}
        </Text>
        <Text variant="bodySmall" style={styles.timestamp}>
          {moment(item.updatedAt).fromNow()}
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
        data={feedbackList}
        renderItem={renderFeedback}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="feedback" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>No feedback found</Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateFeedback' as never)}
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
  subject: {
    marginLeft: 8,
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  message: {
    color: '#666',
    marginBottom: 8,
  },
  timestamp: {
    color: '#999',
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

export default FeedbackScreen;
