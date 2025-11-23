import {Firestore, Collections} from '@/config/firebase';
import type {Route, RouteFormData} from '@/types';

export const createRoute = async (
  routeData: RouteFormData,
  userId: string,
): Promise<string> => {
  try {
    const docRef = await Firestore()
      .collection(Collections.ROUTES)
      .add({
        ...routeData,
        isActive: false,
        createdBy: userId,
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Error creating route: ${error.message}`);
  }
};

export const updateRoute = async (
  routeId: string,
  routeData: Partial<Route>,
): Promise<void> => {
  try {
    await Firestore()
      .collection(Collections.ROUTES)
      .doc(routeId)
      .update({
        ...routeData,
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    throw new Error(`Error updating route: ${error.message}`);
  }
};

export const deleteRoute = async (routeId: string): Promise<void> => {
  try {
    await Firestore().collection(Collections.ROUTES).doc(routeId).delete();
  } catch (error: any) {
    throw new Error(`Error deleting route: ${error.message}`);
  }
};

export const getRoute = async (routeId: string): Promise<Route | null> => {
  try {
    const doc = await Firestore()
      .collection(Collections.ROUTES)
      .doc(routeId)
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
    } as Route;
  } catch (error: any) {
    throw new Error(`Error getting route: ${error.message}`);
  }
};

export const subscribeToRoutes = (
  callback: (routes: Route[]) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.ROUTES)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const routes: Route[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Route[];
        callback(routes);
      },
      error => {
        console.error('Error subscribing to routes:', error);
      },
    );
};

export const subscribeToActiveRoutes = (
  callback: (routes: Route[]) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.ROUTES)
    .where('isActive', '==', true)
    .onSnapshot(
      snapshot => {
        const routes: Route[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Route[];
        callback(routes);
      },
      error => {
        console.error('Error subscribing to active routes:', error);
      },
    );
};

export const activateRoute = async (routeId: string): Promise<void> => {
  try {
    await Firestore().collection(Collections.ROUTES).doc(routeId).update({
      isActive: true,
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Error activating route: ${error.message}`);
  }
};

export const deactivateRoute = async (routeId: string): Promise<void> => {
  try {
    await Firestore().collection(Collections.ROUTES).doc(routeId).update({
      isActive: false,
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Error deactivating route: ${error.message}`);
  }
};
