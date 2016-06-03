

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish(
        'trucks', function trucksPublication() {
            return Trucks.find({});
        });
    Meteor.publish(
        'routes', function routesPublication() {
            return Routes.find({})
        });
    Meteor.publish(
        'feedbacks', function feedbacksPublication() {
            return Feedbacks.find({})
        });
    Meteor.publish(
        'drivers', function driversPublication() {
            return Drivers.find({});
        });


}