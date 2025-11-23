// User Types
export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  roles?: string[];
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  phoneNumber?: string;
  location?: Location;
  notificationArea?: NotificationArea;
  notificationProfiles?: NotificationProfile[]; // SRS 3.1.2.2
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface NotificationArea {
  center: Location;
  radius: number; // in meters
}

// Notification Profile for custom notification settings (SRS 3.1.2.2)
export interface NotificationProfile {
  id: string;
  routeIds: string[]; // Routes to track
  advanceTime: number; // Minutes before truck arrives
  enabled: boolean;
  notificationMethod: 'push' | 'sms' | 'both'; // SRS mentions SMS service
  createdAt: Date;
}

// Truck Types
export interface Truck {
  id: string;
  model: string;
  licenseNumber: string;
  registrationDate: Date;
  location?: Location;
  onDuty: boolean;
  busyHours?: BusyHour[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BusyHour {
  day: DayOfWeek;
  startTime: string; // "HH:mm" format
  endTime: string;
}

export enum DayOfWeek {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
}

// Garbage Types (SRS 3.1.1.1.5)
export enum GarbageType {
  PAPER = 'paper',
  KITCHEN_WASTE = 'kitchen_waste',
  PLASTIC = 'plastic',
  GLASS = 'glass',
  METAL = 'metal',
  OTHER = 'other',
}

// Driver Types
export interface Driver {
  id: string;
  nic: string; // National Identity Card
  employeeNumber: string; // SRS 3.1.1.1.3 - Employee number required
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  busyHours?: BusyHour[];
  createdAt: Date;
  updatedAt: Date;
}

// Route Types
export interface Route {
  id: string;
  name: string;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  waypoints: RoutePoint[];
  schedule: RouteSchedule;
  driverId?: string;
  truckId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  address?: string;
  order?: number;
}

export interface RouteSchedule {
  day: DayOfWeek;
  startTime: string; // "HH:mm" format
  estimatedDuration?: number; // in minutes
  garbageTypes: GarbageType[]; // SRS 3.1.1.1.5 - Garbage types collected on this route
}

// Feedback Types
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  messages: FeedbackMessage[];
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  isAdmin: boolean;
}

export enum FeedbackStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  TRUCK_NEARBY = 'truck_nearby',
  ROUTE_STARTED = 'route_started',
  ROUTE_COMPLETED = 'route_completed',
  SCHEDULE_CHANGE = 'schedule_change',
  FEEDBACK_REPLY = 'feedback_reply',
  GENERAL = 'general',
}

// Marker Types (for map interactions)
export interface Marker {
  id: string;
  location: Location;
  type: MarkerType;
  title?: string;
  description?: string;
  metadata?: any;
}

export enum MarkerType {
  START = 'start',
  END = 'end',
  WAYPOINT = 'waypoint',
  TRUCK = 'truck',
  NOTIFICATION_AREA = 'notification_area',
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Map: { routeId?: string };
  AddRoute: undefined;
  EditRoute: { routeId: string };
  DriverManagement: undefined;
  AddDriver: undefined;
  EditDriver: { driverId: string };
  TruckManagement: undefined;
  AddTruck: undefined;
  EditTruck: { truckId: string };
  Feedback: undefined;
  FeedbackDetail: { feedbackId: string };
  CreateFeedback: undefined;
  Notifications: undefined;
  Profile: undefined;
  LocationSetup: undefined;
  NotificationSetup: undefined;
  AdminPanel: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber?: string;
}

export interface RouteFormData {
  name: string;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  waypoints: RoutePoint[];
  day: DayOfWeek;
  startTime: string;
  estimatedDuration?: number;
  garbageTypes: GarbageType[];
  driverId?: string;
  truckId?: string;
}

export interface TruckFormData {
  model: string;
  licenseNumber: string;
  registrationDate: Date;
  busyHours?: BusyHour[];
}

export interface DriverFormData {
  nic: string;
  employeeNumber: string; // SRS 3.1.1.1.3
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  busyHours?: BusyHour[];
}
