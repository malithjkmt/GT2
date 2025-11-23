import {Firestore, Collections} from '@/config/firebase';
import type {Truck, TruckFormData, BusyHour} from '@/types';

export const createTruck = async (truckData: TruckFormData): Promise<string> => {
  try {
    const docRef = await Firestore()
      .collection(Collections.TRUCKS)
      .add({
        ...truckData,
        onDuty: false,
        busyHours: [],
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Error creating truck: ${error.message}`);
  }
};

export const updateTruck = async (
  truckId: string,
  truckData: Partial<Truck>,
): Promise<void> => {
  try {
    await Firestore()
      .collection(Collections.TRUCKS)
      .doc(truckId)
      .update({
        ...truckData,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    throw new Error(`Error updating truck: ${error.message}`);
  }
};

export const deleteTruck = async (truckId: string): Promise<void> => {
  try {
    await Firestore().collection(Collections.TRUCKS).doc(truckId).delete();
  } catch (error: any) {
    throw new Error(`Error deleting truck: ${error.message}`);
  }
};

export const getTruck = async (truckId: string): Promise<Truck | null> => {
  try {
    const doc = await Firestore()
      .collection(Collections.TRUCKS)
      .doc(truckId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      registrationDate: data?.registrationDate?.toDate(),
      createdAt: data?.createdAt?.toDate(),
      updatedAt: data?.updatedAt?.toDate(),
    } as Truck;
  } catch (error: any) {
    throw new Error(`Error getting truck: ${error.message}`);
  }
};

export const subscribeToTrucks = (
  callback: (trucks: Truck[]) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.TRUCKS)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const trucks: Truck[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          registrationDate: doc.data().registrationDate?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Truck[];
        callback(trucks);
      },
      error => {
        console.error('Error subscribing to trucks:', error);
      },
    );
};

export const updateTruckLocation = async (
  truckId: string,
  latitude: number,
  longitude: number,
): Promise<void> => {
  try {
    await Firestore().collection(Collections.TRUCKS).doc(truckId).update({
      location: {
        latitude,
        longitude,
      },
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Error updating truck location: ${error.message}`);
  }
};

export const updateTruckDutyStatus = async (
  truckId: string,
  onDuty: boolean,
): Promise<void> => {
  try {
    await Firestore().collection(Collections.TRUCKS).doc(truckId).update({
      onDuty,
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Error updating truck duty status: ${error.message}`);
  }
};

export const addTruckBusyHours = async (
  truckId: string,
  busyHour: BusyHour,
): Promise<void> => {
  try {
    await Firestore()
      .collection(Collections.TRUCKS)
      .doc(truckId)
      .update({
        busyHours: Firestore.FieldValue.arrayUnion(busyHour),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    throw new Error(`Error adding busy hours: ${error.message}`);
  }
};

export const getAvailableTrucks = async (
  day: string,
  startTime: string,
): Promise<Truck[]> => {
  try {
    const snapshot = await Firestore().collection(Collections.TRUCKS).get();

    const trucks: Truck[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      registrationDate: doc.data().registrationDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Truck[];

    // Filter trucks that are not busy at the specified time
    return trucks.filter(truck => {
      if (!truck.busyHours || truck.busyHours.length === 0) {
        return true;
      }

      return !truck.busyHours.some(
        bh => bh.day === day && bh.startTime === startTime,
      );
    });
  } catch (error: any) {
    throw new Error(`Error getting available trucks: ${error.message}`);
  }
};
