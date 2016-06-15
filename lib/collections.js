Drivers = new Mongo.Collection('drivers');
Drivers.attachSchema(Schemas.Driver);

Townsmen = new Mongo.Collection('townsmen');
Townsmen.attachSchema(Schemas.Townsman);

Trucks = new Mongo.Collection('trucks');
Trucks.attachSchema(Schemas.Truck);

Feedbacks = new Mongo.Collection('feedbacks');
Feedbacks.attachSchema(Schemas.Feedback);

AdminFeedbacks = new Mongo.Collection('adminFeedbacks');
AdminFeedbacks.attachSchema(Schemas.AdminFeedback);

Routes = new Mongo.Collection('routes');
Routes.attachSchema(Schemas.Route);

Markers = new Mongo.Collection('markers');
Notifications = new Mongo.Collection('notifications');