import './subscribe.html';

var directionsDisplayArray = [];

var ZOOM_LEVEL = 5; // ideal zoom level for streets
var count = 0;
var readyCount = 1;
var renderedCount = 1;
var routesCursor;

Template.subscribe.rendered = function () {


};

Template.subscribe.helpers({

    routes: function () {
        routesCursor = Routes.find({});
        return routesCursor;
    }


});


Template.subscribe.events({

    'click #test'(event) {
       // console.log(routesCursor.fetch()[20].mapRoute);
        Meteor.call('dl');
    }


});

Template.routeMap.helpers({
    geolocationError: function () {
        var error = Geolocation.error();
        return error && error.message;
    },
    myMapOptions: function () {
        if (GoogleMaps.loaded()) {

            // Map options
            var mapOptions = {
                zoom: ZOOM_LEVEL,
                center: new google.maps.LatLng(6.523693, 80.096866),
            };
            return mapOptions;
        }
    },
    routes: function () {

        return Routes.find({});
    },
    index: function () {
        count++;
        return "map" + count;
    }


});

Template.routeMap.onRendered(function () {

    var mapName = "map" + renderedCount;
    renderedCount++;
    GoogleMaps.ready(mapName, function (map) {
        console.log("map map" + readyCount + " is ready");

            var display = new google.maps.DirectionsRenderer({
                draggable: false,
                map: map.instance,
            });

            var temp = JSON.parse(routesCursor.fetch()[readyCount-1].mapRoute);
            display.setDirections(temp);

            directionsDisplayArray.push(display);

        readyCount++;
    });


});

function setZm(mapName) {
    /*console.log(mapName.instance.getZoom());
     mapName.instance.setZoom(15);*/


}