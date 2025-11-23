/**
 * Firebase Cloud Functions for GT2 Notification Service
 *
 * SRS Requirements:
 * - 3.1.1.1.5: 10-minute delay before sending route activation notifications
 * - 3.1.2.1: Estimated time to arrival notifications
 * - 3.1.2.2: Custom notification profiles for townspeople
 *
 * Setup Instructions:
 * 1. Install Firebase Functions: npm install -g firebase-tools
 * 2. Initialize functions: firebase init functions
 * 3. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Triggered when a route is activated
 * SRS 3.1.1.1.5: Wait 10 minutes, then notify subscribed users
 */
exports.onRouteActivated = functions.firestore
  .document('routes/{routeId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const routeId = context.params.routeId;

    // Check if route was just activated
    if (!before.isActive && after.isActive) {
      console.log(`Route ${routeId} activated. Setting up 10-minute delay notification.`);

      // SRS 3.1.1.1.5: Schedule notification after 10 minutes
      // Using Cloud Tasks or PubSub for delayed execution
      const delayMinutes = 10;
      const notificationTime = Date.now() + (delayMinutes * 60 * 1000);

      // Store pending notification
      await db.collection('pendingNotifications').add({
        type: 'route_activation',
        routeId: routeId,
        route: after,
        scheduledFor: new Date(notificationTime),
        status: 'pending',
        createdAt: new Date(),
      });

      return null;
    }

    return null;
  });

/**
 * Scheduled function to process pending notifications
 * Runs every minute to check for notifications that need to be sent
 */
exports.processPendingNotifications = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = new Date();

    // Get all pending notifications that should be sent now
    const pendingSnapshot = await db.collection('pendingNotifications')
      .where('status', '==', 'pending')
      .where('scheduledFor', '<=', now)
      .get();

    if (pendingSnapshot.empty) {
      console.log('No pending notifications to process');
      return null;
    }

    const promises = [];

    pendingSnapshot.forEach(doc => {
      const notification = doc.data();

      if (notification.type === 'route_activation') {
        promises.push(sendRouteActivationNotifications(notification, doc.id));
      } else if (notification.type === 'eta_warning') {
        promises.push(sendETANotification(notification, doc.id));
      }
    });

    await Promise.all(promises);
    return null;
  });

/**
 * Send route activation notifications to subscribed users
 * SRS 3.1.2.2: Use custom notification profiles
 */
async function sendRouteActivationNotifications(notification, notificationId) {
  try {
    const route = notification.route;
    const routeId = notification.routeId;

    // Get all users with notification profiles for this route
    const usersSnapshot = await db.collection('users')
      .where('profile.notificationProfiles', 'array-contains-any', [
        { routeIds: [routeId] }
      ])
      .get();

    const notifications = [];

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      // Check user's notification profiles
      const profiles = user.profile?.notificationProfiles || [];
      const relevantProfile = profiles.find(p =>
        p.routeIds.includes(routeId) && p.enabled
      );

      if (!relevantProfile) continue;

      // Create notification
      const notificationData = {
        userId: userId,
        title: 'Garbage Truck Route Active',
        message: `Route "${route.name}" is now active. Estimated arrival in ${relevantProfile.advanceTime} minutes.`,
        type: 'route_started',
        data: {
          routeId: routeId,
          routeName: route.name,
          estimatedArrival: relevantProfile.advanceTime,
        },
        read: false,
        createdAt: new Date(),
      };

      // Save to Firestore
      await db.collection('notifications').add(notificationData);

      // Send push notification if requested
      if (relevantProfile.notificationMethod === 'push' ||
          relevantProfile.notificationMethod === 'both') {
        if (user.fcmToken) {
          notifications.push({
            token: user.fcmToken,
            notification: {
              title: notificationData.title,
              body: notificationData.message,
            },
            data: {
              routeId: routeId,
              type: 'route_started',
            },
          });
        }
      }

      // Send SMS if requested (SRS 3.10.4)
      if (relevantProfile.notificationMethod === 'sms' ||
          relevantProfile.notificationMethod === 'both') {
        if (user.profile?.phoneNumber) {
          // TODO: Integrate with Dialog Ideamart SMS API
          console.log(`Would send SMS to ${user.profile.phoneNumber}`);
        }
      }
    }

    // Send batch push notifications
    if (notifications.length > 0) {
      const response = await messaging.sendAll(notifications);
      console.log(`Sent ${response.successCount} push notifications for route ${routeId}`);
    }

    // Mark notification as sent
    await db.collection('pendingNotifications').doc(notificationId).update({
      status: 'sent',
      sentAt: new Date(),
    });

    console.log(`Route activation notifications sent for ${routeId}`);
  } catch (error) {
    console.error('Error sending route activation notifications:', error);

    // Mark as failed
    await db.collection('pendingNotifications').doc(notificationId).update({
      status: 'failed',
      error: error.message,
      failedAt: new Date(),
    });
  }
}

/**
 * Send ETA warning notification
 * SRS 3.1.2.1: Notify users when truck is approaching
 */
async function sendETANotification(notification, notificationId) {
  try {
    const { userId, routeId, routeName, estimatedMinutes } = notification;

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const user = userDoc.data();

    // Create notification
    const notificationData = {
      userId: userId,
      title: 'Truck Approaching',
      message: `Garbage truck on route "${routeName}" will arrive in approximately ${estimatedMinutes} minutes.`,
      type: 'truck_nearby',
      data: {
        routeId: routeId,
        routeName: routeName,
        eta: estimatedMinutes,
      },
      read: false,
      createdAt: new Date(),
    };

    // Save to Firestore
    await db.collection('notifications').add(notificationData);

    // Send push notification
    if (user.fcmToken) {
      await messaging.send({
        token: user.fcmToken,
        notification: {
          title: notificationData.title,
          body: notificationData.message,
        },
        data: {
          routeId: routeId,
          type: 'truck_nearby',
        },
      });
    }

    // Mark as sent
    await db.collection('pendingNotifications').doc(notificationId).update({
      status: 'sent',
      sentAt: new Date(),
    });

    console.log(`ETA notification sent to user ${userId}`);
  } catch (error) {
    console.error('Error sending ETA notification:', error);

    await db.collection('pendingNotifications').doc(notificationId).update({
      status: 'failed',
      error: error.message,
      failedAt: new Date(),
    });
  }
}

/**
 * Monitor truck locations and trigger ETA notifications
 * Runs when truck location is updated
 */
exports.onTruckLocationUpdate = functions.firestore
  .document('trucks/{truckId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const truckId = context.params.truckId;

    if (!after.location || !after.onDuty) {
      return null;
    }

    // Find active route for this truck
    const routesSnapshot = await db.collection('routes')
      .where('truckId', '==', truckId)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (routesSnapshot.empty) {
      return null;
    }

    const route = routesSnapshot.docs[0].data();
    const routeId = routesSnapshot.docs[0].id;

    // Get users subscribed to this route
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      const userId = userDoc.id;

      const profiles = user.profile?.notificationProfiles || [];
      const relevantProfile = profiles.find(p =>
        p.routeIds.includes(routeId) && p.enabled
      );

      if (!relevantProfile || !user.profile?.location) {
        continue;
      }

      // Calculate ETA (simplified - should use route waypoints)
      const distance = calculateDistance(
        after.location.latitude,
        after.location.longitude,
        user.profile.location.latitude,
        user.profile.location.longitude
      );

      const averageSpeed = 30; // km/h
      const distanceKm = distance / 1000;
      const etaMinutes = Math.ceil((distanceKm / averageSpeed) * 60);

      // Check if we should notify (within advance time window)
      if (etaMinutes <= relevantProfile.advanceTime && etaMinutes > 0) {
        // Check if we already sent a notification recently
        const recentNotifications = await db.collection('notifications')
          .where('userId', '==', userId)
          .where('type', '==', 'truck_nearby')
          .where('data.routeId', '==', routeId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        let shouldNotify = true;
        if (!recentNotifications.empty) {
          const lastNotification = recentNotifications.docs[0].data();
          const timeSinceLastNotification = Date.now() - lastNotification.createdAt.toMillis();
          const fiveMinutes = 5 * 60 * 1000;

          if (timeSinceLastNotification < fiveMinutes) {
            shouldNotify = false;
          }
        }

        if (shouldNotify) {
          // Schedule immediate ETA notification
          await db.collection('pendingNotifications').add({
            type: 'eta_warning',
            userId: userId,
            routeId: routeId,
            routeName: route.name,
            estimatedMinutes: etaMinutes,
            scheduledFor: new Date(),
            status: 'pending',
            createdAt: new Date(),
          });
        }
      }
    }

    return null;
  });

/**
 * Helper function to calculate distance between two points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

module.exports = exports;
