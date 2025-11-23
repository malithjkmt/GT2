import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

const FeedbackDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Feedback Detail Screen - To be implemented</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedbackDetailScreen;
