# Garbage Truck Tracker - React Native + Firebase

A real-time waste management tracking system built with React Native and Firebase. This app allows municipal councils to track garbage collection trucks, manage routes, and notify residents about collection schedules.

## Features

- **Real-time GPS Tracking** - Track garbage trucks in real-time on interactive maps
- **Route Management** - Create, edit, and manage collection routes with waypoints
- **Driver & Truck Management** - Manage fleet resources and availability
- **Live Map View** - View active routes and truck locations with Google Maps integration
- **Push Notifications** - Get notified when trucks are nearby
- **Feedback System** - Two-way communication between residents and administrators
- **User Authentication** - Secure Firebase authentication
- **Role-based Access** - Different views for administrators and townspeople

## Tech Stack

- **React Native 0.82.0** - Latest React Native framework
- **TypeScript** - Type-safe development
- **Firebase**:
  - Authentication
  - Cloud Firestore (database)
  - Cloud Storage
  - Cloud Messaging (push notifications)
- **React Navigation 7** - Navigation system
- **Google Maps** - Real-time map tracking and route planning
- **React Native Paper** - Material Design UI components

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (>= 18.x)
- npm or yarn
- React Native development environment:
  - For iOS: Xcode (macOS only)
  - For Android: Android Studio with Android SDK
- CocoaPods (for iOS): `sudo gem install cocoapods`

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd GT2/react-native-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Install iOS dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - Authentication (Email/Password)
   - Cloud Firestore
   - Cloud Storage
   - Cloud Messaging

### 2. Add Android App

1. In Firebase Console, add an Android app
2. Package name: `com.garbagetrucktracker`
3. Download `google-services.json`
4. Replace the file at `android/app/google-services.json` with your downloaded file

### 3. Add iOS App

1. In Firebase Console, add an iOS app
2. Bundle ID: `com.garbagetrucktracker`
3. Download `GoogleService-Info.plist`
4. Replace the file at `ios/GoogleService-Info.plist` with your downloaded file

### 4. Configure Firebase in the app

Update `src/config/firebase.ts` with your Firebase configuration:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "YOUR_DATABASE_URL",
};
```

### 5. Set up Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /routes/{routeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }

    match /drivers/{driverId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }

    match /trucks/{truckId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny(['admin']);
    }

    match /feedback/{feedbackId} {
      allow read, write: if request.auth != null;
    }

    match /notifications/{notificationId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }
  }
}
```

## Google Maps Setup

### 1. Get API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
   - Geolocation API
4. Create API credentials for each platform

### 2. Configure Android

Add your API key to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <!-- ... -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_ANDROID_API_KEY"/>
</application>
```

### 3. Configure iOS

Add your API key to `ios/GarbageTruckTracker/AppDelegate.mm`:

```objective-c
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_IOS_API_KEY"];
  // ...
}
```

### 4. Update config file

Update `src/config/firebase.ts`:

```typescript
export const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
```

## Running the App

### Android

```bash
npm run android
# or
yarn android
```

### iOS (macOS only)

```bash
npm run ios
# or
yarn ios
```

### Start Metro Bundler

```bash
npm start
# or
yarn start
```

## Project Structure

```
react-native-app/
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/           # Firebase and app configuration
│   ├── context/          # React Context (Auth, etc.)
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   │   ├── Auth/        # Login, Register
│   │   ├── Home/        # Home screen with routes
│   │   ├── Map/         # Real-time map view
│   │   ├── Routes/      # Route management
│   │   ├── Drivers/     # Driver management
│   │   ├── Trucks/      # Truck management
│   │   ├── Feedback/    # Feedback system
│   │   └── ...
│   ├── services/         # Firebase services
│   │   ├── routeService.ts
│   │   ├── truckService.ts
│   │   ├── driverService.ts
│   │   ├── feedbackService.ts
│   │   ├── notificationService.ts
│   │   └── geolocationService.ts
│   ├── theme/            # App theme and styles
│   └── types/            # TypeScript type definitions
├── android/              # Android native code
├── ios/                  # iOS native code
├── App.tsx              # Root component
├── package.json
└── tsconfig.json
```

## Key Screens

### Authentication
- **Login** - Email/password authentication
- **Register** - New user registration

### Main App
- **Home** - View and manage all routes
- **Map** - Real-time tracking of active routes and trucks
- **Profile** - User profile and settings

### Management (Admin Only)
- **Add/Edit Routes** - Create routes with map-based waypoint selection
- **Driver Management** - Add, edit, and view drivers
- **Truck Management** - Manage truck fleet
- **Admin Panel** - User role management

### Townspeople Features
- **Feedback** - Submit and track feedback
- **Notifications** - View notification history
- **Location Setup** - Set home location
- **Notification Settings** - Configure notification preferences

## Data Models

### Route
```typescript
{
  id: string;
  name: string;
  startPoint: {latitude, longitude};
  endPoint: {latitude, longitude};
  waypoints: [{latitude, longitude}];
  schedule: {day, startTime};
  driverId?: string;
  truckId?: string;
  isActive: boolean;
}
```

### Truck
```typescript
{
  id: string;
  model: string;
  licenseNumber: string;
  location?: {latitude, longitude};
  onDuty: boolean;
  busyHours?: [{day, startTime, endTime}];
}
```

### Driver
```typescript
{
  id: string;
  name: string;
  nic: string;
  licenseNumber: string;
  phoneNumber: string;
  busyHours?: [{day, startTime, endTime}];
}
```

## Troubleshooting

### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Issues

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Metro Bundler Issues

```bash
npm start -- --reset-cache
```

### Clear Cache

```bash
npm start -- --reset-cache
rm -rf node_modules
npm install
```

## Environment Variables

For production, use environment variables instead of hardcoded credentials:

```bash
# .env file
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_MAPS_API_KEY=your_maps_key
```

Use `react-native-config` to load environment variables.

## Testing

```bash
npm test
# or
yarn test
```

## Building for Production

### Android

```bash
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### iOS

1. Open `ios/GarbageTruckTracker.xcworkspace` in Xcode
2. Select "Product" > "Archive"
3. Follow the App Store submission process

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
