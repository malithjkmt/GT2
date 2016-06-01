import './subscribe.html';

var directionsDisplayArray = [];

var ZOOM_LEVEL = 5; // ideal zoom level for streets
var count = 0;
var readyCount = 1;
var renderedCount = 1;

Template.subscribe.rendered = function () {


};

Template.subscribe.helpers({

    routes: function () {
        return Routes.find({});
    }


});


Template.subscribe.events({

    'click #test'(event) {
        GoogleMaps.maps.map2.instance.setZoom(15);
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
        return "map"+count;
    }


});

Template.routeMap.onRendered(function () {

        var mapName = "map" + renderedCount;
        renderedCount++;
        GoogleMaps.ready(mapName, function (map) {
            console.log("map map" + readyCount + " is ready");
            readyCount++;


      var display = new google.maps.DirectionsRenderer({
     draggable: false,
     map: map.instance,
     });

     var temp = JSON.parse(Routes.findOne({_id: 'zKGjheNrBszRoXi68'}).mapRoute);
     display.setDirections(temp);

     directionsDisplayArray.push(display);

        });


});

function setZm(mapName) {
    /*console.log(mapName.instance.getZoom());
    mapName.instance.setZoom(15);*/


}