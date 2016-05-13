import './route.js';
import './autoform.js';

Meteor.startup(function () {
    GoogleMaps.load({ key: 'AIzaSyAw3j_hFZLxSbS5X7jRNLywgXIRVUYGeuw'});
    //GoogleMaps.load({ v: '3', key: '12345', libraries: 'geometry,places' });
});