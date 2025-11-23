import {Firestore, Collections} from '@/config/firebase';
import type {Driver, DriverFormData, BusyHour} from '@/types';

export const createDriver = async (
  driverData: DriverFormData,
): Promise<string> => {
  try {
    const docRef = await Firestore()
      .collection(Collections.DRIVERS)
      .add({
        ...driverData,
        busyHours: [],
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Error creating driver: ${error.message}`);
  }
};

export const updateDriver = async (
  driverId: string,
  driverData: Partial<Driver>,
): Promise<void> => {
  try {
    await Firestore()
      .collection(Collections.DRIVERS)
      .doc(driverId)
      .update({
        ...driverData,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    throw new Error(`Error updating driver: ${error.message}`);
  }
};

export const deleteDriver = async (driverId: string): Promise<void> => {
  try {
    await Firestore().collection(Collections.DRIVERS).doc(driverId).delete();
  } catch (error: any) {
    throw new Error(`Error deleting driver: ${error.message}`);
  }
};

export const getDriver = async (driverId: string): Promise<Driver | null> => {
  try {
    const doc = await Firestore()
      .collection(Collections.DRIVERS)
      .doc(driverId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt?.toDate(),
      updatedAt: data?.updatedAt?.toDate(),
    } as Driver;
  } catch (error: any) {
    throw new Error(`Error getting driver: ${error.message}`);
  }
};

export const subscribeToDrivers = (
  callback: (drivers: Driver[]) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.DRIVERS)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const drivers: Driver[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Driver[];
        callback(drivers);
      },
      error => {
        console.error('Error subscribing to drivers:', error);
      },
    );
};

export const addDriverBusyHours = async (
  driverId: string,
  busyHour: BusyHour,
): Promise<void> => {
  try {
    await Firestore()
      .collection(Collections.DRIVERS)
      .doc(driverId)
      .update({
        busyHours: Firestore.FieldValue.arrayUnion(busyHour),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    throw new Error(`Error adding busy hours: ${error.message}`);
  }
};

export const getAvailableDrivers = async (
  day: string,
  startTime: string,
): Promise<Driver[]> => {
  try {
    const snapshot = await Firestore().collection(Collections.DRIVERS).get();

    const drivers: Driver[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Driver[];

    // Filter drivers that are not busy at the specified time
    return drivers.filter(driver => {
      if (!driver.busyHours || driver.busyHours.length === 0) {
        return true;
      }

      return !driver.busyHours.some(
        bh => bh.day === day && bh.startTime === startTime,
      );
    });
  } catch (error: any) {
    throw new Error(`Error getting available drivers: ${error.message}`);
  }
};
