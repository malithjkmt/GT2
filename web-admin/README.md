# GT2 Admin Web Dashboard

Web-based administration dashboard for the Garbage Truck Tracker (GT2) system. This application provides system administrators with tools to manage routes, trucks, drivers, and monitor the fleet in real-time.

## Overview

This is a React.js web application built with Vite, Material-UI, and Firebase. It serves as the administrative interface for the GT2 system, as specified in the SRS document.

## Features

### Implemented
- ✅ **Authentication** - Admin-only login with Firebase Auth
- ✅ **Dashboard** - Overview of system statistics
- ✅ **Responsive Layout** - Material-UI based responsive design
- ✅ **Navigation** - Drawer-based navigation system

### To Be Implemented (Per SRS Requirements)
- 🔄 **Route Management**
  - Draw routes on Google Maps with drawing tools
  - Set garbage type per day of week (paper, kitchen waste, etc.)
  - Assign available trucks and drivers
  - Schedule management (day, start time, estimated duration)

- 🔄 **Live Fleet Map**
  - Real-time truck tracking
  - View entire fleet or filter by route
  - Info windows with truck/route details
  - Different markers for on-duty/off-duty trucks

- 🔄 **Truck Management**
  - Register/update truck details
  - Track busy hours and availability
  - Real-time location updates

- 🔄 **Driver Management**
  - Register/update driver details (including employee number)
  - Manage busy hours
  - SMS notifications on route assignment

- 🔄 **Feedback Management**
  - View townspeople feedback
  - Respond to feedback (with notifications to users)
  - Anonymous feedback handling

- 🔄 **User Management**
  - Register townspeople
  - Promote users to admin
  - Update user profiles

## Technology Stack

- **React 18.3.1** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI) v6** - UI component library
- **React Router v6** - Client-side routing
- **Firebase v11** - Backend services
  - Authentication
  - Firestore database
  - Cloud Storage
- **Google Maps API** - Mapping and route drawing
- **Notistack** - Notifications/snackbars

## Project Structure

```
web-admin/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx          # Main admin layout with drawer
│   ├── config/
│   │   └── firebase.js               # Firebase configuration
│   ├── context/
│   │   └── AuthContext.jsx           # Authentication context
│   ├── pages/
│   │   ├── Login.jsx                 # Admin login page
│   │   ├── Dashboard.jsx             # Main dashboard
│   │   ├── LiveMap.jsx               # Real-time fleet tracking map
│   │   ├── RouteManagement.jsx       # Route CRUD operations
│   │   ├── AddRoute.jsx              # Create new route
│   │   ├── EditRoute.jsx             # Edit existing route
│   │   ├── TruckManagement.jsx       # Truck fleet management
│   │   ├── DriverManagement.jsx      # Driver management
│   │   ├── FeedbackManagement.jsx    # Feedback system
│   │   └── UserManagement.jsx        # User administration
│   ├── App.jsx                       # Root component
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Installation

```bash
cd web-admin
npm install
```

## Configuration

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication, Firestore, and Storage
3. Update `src/config/firebase.js` with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Google Maps API

Update the `GOOGLE_MAPS_API_KEY` in `src/config/firebase.js`:

```javascript
export const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";
```

Enable the following APIs in Google Cloud Console:
- Maps JavaScript API
- Directions API
- Drawing Library
- Geocoding API

## Development

```bash
npm run dev
```

Opens http://localhost:3000

## Build

```bash
npm run build
```

Output in `dist/` directory

## Deployment

### Option 1: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Option 2: Galaxy (Meteor Hosting - as per SRS)

For compatibility with the original Meteor-based system mentioned in the SRS, you can deploy to Galaxy or any static hosting service.

## SRS Requirements Mapping

| SRS Requirement | Status | Notes |
|----------------|--------|-------|
| Web-based admin interface | ✅ | React.js with Material-UI |
| Route management with map | 🔄 | Structure created, needs Google Maps integration |
| Real-time truck tracking | 🔄 | Firebase real-time listeners ready |
| Driver management | 🔄 | CRUD structure in place |
| Truck management | 🔄 | CRUD structure in place |
| Feedback system | 🔄 | Two-way communication structure |
| User management | 🔄 | Admin can manage townspeople accounts |
| Material Design | ✅ | Using Material-UI |
| MongoDB → Firebase | ✅ | Migrated to Firestore |

## Next Steps

1. **Implement Route Drawing**
   - Integrate Google Maps Drawing Manager
   - Add polyline editing tools
   - Save route coordinates to Firestore

2. **Add Garbage Type Selection**
   - Checkboxes for garbage types (paper, kitchen waste, etc.)
   - Day-of-week selectors

3. **Busy Hours Management**
   - UI for selecting busy hours for drivers/trucks
   - Availability checker

4. **SMS Integration**
   - Dialog Ideamart API integration (Sri Lankan SMS service)
   - Send route details to drivers
   - Send notifications to townspeople

5. **Complete All CRUD Operations**
   - Finish truck, driver, user, and feedback forms
   - Add validation with Yup
   - Implement edit/delete functionality

## Security

- Admin-only access enforced by AuthContext
- Firestore security rules should restrict write access to admin users
- Environment variables for sensitive credentials (production)

## License

Proprietary - Municipal Council Use Only
