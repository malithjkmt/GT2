import './subscribe.html';

var directionsDisplayArray = [];

var ZOOM_LEVEL = 5; // ideal zoom level for streets
var count = 0;
var readyCount = 1;

Template.subscribe.rendered = function () {


};

Template.subscribe.helpers({

    routes: function () {
        return Routes.find({});
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
        return count;
    }


});

Template.routeMap.onRendered(function () {
    console.log(GoogleMaps.maps);

    GoogleMaps.ready('' + readyCount + '', function (map) {
        console.log("map " + readyCount + " is ready");
        readyCount++;
        map.instance.setZoom(15);
      /*  var display = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });

        var temp = JSON.parse(Routes.findOne({_id: 'zKGjheNrBszRoXi68'}).mapRoute);
        display.setDirections(temp);

        directionsDisplayArray.push(display);*/

    });


});

