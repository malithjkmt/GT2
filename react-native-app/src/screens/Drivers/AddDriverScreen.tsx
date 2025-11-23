import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {TextInput, Button, Card} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {createDriver} from '@/services/driverService';
import type {DriverFormData} from '@/types';

const AddDriverScreen: React.FC = () => {
  const [nic, setNic] = useState('');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!nic || !name || !licenseNumber || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const driverData: DriverFormData = {nic, name, licenseNumber, phoneNumber};
      await createDriver(driverData);
      Alert.alert('Success', 'Driver added successfully');
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
        <Card.Title title="Add New Driver" />
        <Card.Content>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="NIC Number"
            value={nic}
            onChangeText={setNic}
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
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}>
            Add Driver
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

export default AddDriverScreen;
