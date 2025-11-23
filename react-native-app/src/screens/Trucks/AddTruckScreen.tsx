import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {TextInput, Button, Card} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {createTruck} from '@/services/truckService';
import type {TruckFormData} from '@/types';

const AddTruckScreen: React.FC = () => {
  const [model, setModel] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!model || !licenseNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const truckData: TruckFormData = {
        model,
        licenseNumber,
        registrationDate: new Date(),
      };
      await createTruck(truckData);
      Alert.alert('Success', 'Truck added successfully');
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
        <Card.Title title="Add New Truck" />
        <Card.Content>
          <TextInput
            label="Truck Model"
            value={model}
            onChangeText={setModel}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="License Number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            mode="outlined"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}>
            Add Truck
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            Cancel
          </Button>
        </Card.Content>
      </Card>
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
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
});

export default AddTruckScreen;
