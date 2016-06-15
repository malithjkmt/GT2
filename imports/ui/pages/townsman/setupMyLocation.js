
import './setupMyLocation.html';

var ZOOM_LEVEL = 15; // ideal zoom level for streets
var myMarker = null;

Template.myLocMap.helpers({
    geolocationError: function () {
        var error = Geolocation.error();
        return error && error.message;
    },
    myMapOptions: function () {
        latLng = Geolocation.latLng();

        if (GoogleMaps.loaded() && latLng) {

            // Map options
            var mapOptions = {
                zoom: ZOOM_LEVEL,
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,

                // map controls
                zoomControl: false,
                mapTypeControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                fullscreenControl: true,

                // modify map type control
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DEFAULT,
                    position: google.maps.ControlPosition.LEFT_BOTTOM,
                    mapTypeIds: [
                        google.maps.MapTypeId.ROADMAP,
                        google.maps.MapTypeId.HYBRID,
                    ]
                },
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP
                }
            };
            return mapOptions;
        }
    }

});


Template.setupMyLocation.events({
    'click #saveLoc'(event) {
        if(!myMarker){
            return;
        }
        var pos = {lat: myMarker.position.lat(), lng: myMarker.position.lng()};
        var user_id = Meteor.user()._id;
        Meteor.call('updateMyLocation', user_id, pos);

    }
});



Template.myLocMap.onCreated(function () {

    GoogleMaps.ready('myLocMap', function (map) {
        console.log("map is ready!");

        google.maps.event.addListener(map.instance, 'click', function (event) {

            if(myMarker){
                myMarker.setMap(null);
            }
            myMarker = new google.maps.Marker({
                position: {lat: event.latLng.lat(), lng: event.latLng.lng()},
                map: map.instance,
                title: "me",
                draggable: true,
                animation: google.maps.Animation.DROP

            });
        });
    });

});
