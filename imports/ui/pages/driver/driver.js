
import './registerDriver.html';
import './updateDriver.html';
import './viewDrivers.html';

Template.viewDrivers.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('drivers');
});

Template.viewDrivers.helpers({
    drivers() {
        return Drivers.find({});
    }
});
