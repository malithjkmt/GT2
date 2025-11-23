import {PermissionsAndroid, Platform} from 'react-native';
import {Messaging, Firestore, Collections} from '@/config/firebase';

export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } else {
      const authStatus = await Messaging().requestPermission();
      const enabled =
        authStatus === Messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === Messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const token = await Messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const saveFCMToken = async (userId: string, token: string) => {
  try {
    await Firestore().collection(Collections.USERS).doc(userId).update({
      fcmToken: token,
      fcmTokenUpdatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

export const setupNotificationListeners = (
  onNotification: (notification: any) => void,
) => {
  // Foreground notification handler
  const unsubscribeForeground = Messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);
    onNotification(remoteMessage);
  });

  // Background notification handler
  Messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification:', remoteMessage);
  });

  // Notification opened app from background
  Messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
    onNotification(remoteMessage);
  });

  // Check if app was opened from a notification (app was closed)
  Messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from notification:', remoteMessage);
        onNotification(remoteMessage);
      }
    });

  return unsubscribeForeground;
};

export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data?: any,
) => {
  try {
    // Save notification to Firestore
    await Firestore().collection(Collections.NOTIFICATIONS).add({
      userId,
      title,
      message: body,
      data: data || {},
      read: false,
      createdAt: Firestore.FieldValue.serverTimestamp(),
    });

    // Note: Actual FCM sending should be done via Cloud Functions
    // This is just saving to database
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
