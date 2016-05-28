import './route.js';
import './autoform.js';

Meteor.startup(function () {
    GoogleMaps.load({ key: 'AIzaSyAHM8gxbuwZEThMNM0DUYbP-vgvIxUQELs'});
    //GoogleMaps.load({ v: '3', key: '12345', libraries: 'geometry,places' });
});