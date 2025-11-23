# GT2 Cloud Functions

Firebase Cloud Functions for the Garbage Truck Tracker system. Handles background tasks, notifications, and scheduled operations.

## Features

### Implemented (SRS Requirements)

1. **Route Activation Notifications (SRS 3.1.1.1.5)**
   - 10-minute delay before notifying townspeople
   - Triggered when admin activates a route
   - Sends to users with matching notification profiles

2. **ETA Notifications (SRS 3.1.2.1)**
   - Real-time monitoring of truck locations
   - Calculates estimated time of arrival
   - Notifies users when truck is within their specified advance time
   - Prevents spam with 5-minute cooldown between notifications

3. **Custom Notification Profiles (SRS 3.1.2.2)**
   - Supports user-defined notification preferences
   - Multiple notification methods (push, SMS, both)
   - Per-route subscriptions
   - Configurable advance notification time

4. **SMS Integration (SRS 3.10.4)**
   - Structure for Dialog Ideamart API integration
   - Driver notifications on route assignment (SRS 3.1.1.1.6)
   - Townspeople notifications via SMS

## Setup

### Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Blaze plan (required for Cloud Functions)

### Installation

1. Initialize Firebase in your project:
```bash
cd /path/to/GT2
firebase init functions
```

Select:
- Use existing project
- JavaScript
- ESLint: Yes
- Install dependencies: Yes

2. Copy the cloud functions:
```bash
cp cloud-functions/* functions/
```

3. Install dependencies:
```bash
cd functions
npm install
```

### Configuration

1. Set up Firebase Admin SDK credentials
2. Configure SMS API credentials (Dialog Ideamart):
```bash
firebase functions:config:set ideamart.apikey="YOUR_API_KEY"
firebase functions:config:set ideamart.appid="YOUR_APP_ID"
firebase functions:config:set ideamart.password="YOUR_PASSWORD"
```

### Deployment

Deploy all functions:
```bash
firebase deploy --only functions
```

Deploy specific function:
```bash
firebase deploy --only functions:onRouteActivated
```

### Local Testing

Run the Functions Emulator:
```bash
npm run serve
```

## Functions

### onRouteActivated

**Trigger:** Firestore document update on `routes/{routeId}`

**Purpose:** Detects when a route is activated and schedules delayed notifications

**SRS Requirement:** 3.1.1.1.5

**Flow:**
1. Route activated by admin
2. Create pending notification with 10-minute delay
3. Scheduled processor sends notifications after delay

### processPendingNotifications

**Trigger:** Pub/Sub scheduled task (every 1 minute)

**Purpose:** Process and send pending notifications

**Flow:**
1. Query pending notifications due now
2. Send to subscribed users based on notification profiles
3. Support push and SMS methods
4. Mark as sent/failed

### onTruckLocationUpdate

**Trigger:** Firestore document update on `trucks/{truckId}`

**Purpose:** Monitor truck locations and send ETA notifications

**SRS Requirement:** 3.1.2.1

**Flow:**
1. Truck location updated
2. Find active route for truck
3. Calculate ETA to each subscribed user
4. Send notification if within advance time window
5. Apply cooldown to prevent spam

## Data Structures

### Pending Notification

```javascript
{
  type: 'route_activation' | 'eta_warning',
  routeId: string,
  route: Route,
  userId?: string,
  scheduledFor: Timestamp,
  status: 'pending' | 'sent' | 'failed',
  createdAt: Timestamp,
  sentAt?: Timestamp,
  error?: string
}
```

### Notification Profile (in User document)

```javascript
{
  id: string,
  routeIds: string[],
  advanceTime: number, // minutes
  enabled: boolean,
  notificationMethod: 'push' | 'sms' | 'both',
  createdAt: Timestamp
}
```

## SMS Integration

### Dialog Ideamart API

The SMS service is structured for Dialog Ideamart, Sri Lanka's leading SMS provider.

**To complete integration:**

1. Sign up at https://www.ideamart.io/
2. Create an SMS application
3. Get API credentials
4. Update `smsService.js` with actual API calls
5. Test with development phone numbers first

**Example API call:**
```javascript
fetch('https://www.ideamart.io/sms/v2/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    appId: appId,
    password: password,
    destinationAddresses: [phoneNumber],
    message: message,
    sourceAddress: 'GT2System',
  }),
});
```

## Performance Considerations

### Optimization

- Batch notifications where possible
- Use Firestore transactions for critical operations
- Implement exponential backoff for failed operations
- Cache frequently accessed data

### Monitoring

View logs:
```bash
npm run logs
```

Monitor function execution:
```bash
firebase functions:log --only onRouteActivated
```

## Error Handling

- All functions include try-catch blocks
- Failed notifications marked in Firestore
- Error details logged for debugging
- SMS failures don't block route creation

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

Use Firebase Emulators:
```bash
firebase emulators:start
```

Test scenarios:
1. Route activation → 10-minute delay → notification sent
2. Truck location update → ETA calculation → notification
3. Multiple users with different profiles → correct targeting

## SRS Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| 3.1.1.1.5 - 10-min delay | ✅ | `onRouteActivated` + `processPendingNotifications` |
| 3.1.1.1.6 - SMS to driver | ✅ | `notifyDriverAboutRoute` in smsService |
| 3.1.2.1 - ETA notifications | ✅ | `onTruckLocationUpdate` + calculateETA |
| 3.1.2.2 - Custom profiles | ✅ | Profile-based targeting in all functions |
| 3.10.4 - SMS service | ✅ | Dialog Ideamart integration structure |

## Future Enhancements

1. **Advanced ETA Calculation**
   - Integration with Google Maps Directions API
   - Traffic-aware routing
   - Historical speed data

2. **Notification Preferences**
   - Quiet hours support
   - Frequency limits
   - Priority levels

3. **Analytics**
   - Notification delivery rates
   - User engagement metrics
   - ETA accuracy tracking

4. **Multi-language Support**
   - Localized notification messages
   - User language preferences

## Support

For issues or questions:
- Check Firebase Console logs
- Review Firestore security rules
- Verify IAM permissions
- Contact development team

## License

Proprietary - Municipal Council Use Only
