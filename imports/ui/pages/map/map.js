import './map.html';

var ZOOM_LEVEL = 10; // ideal zoom level for streets

Template.map.helpers({
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


Template.map.onCreated(function() {
    var self = this;
    var markers = [];

    GoogleMaps.ready('myMap', function(myMap) {
        console.log("I'm ready!");



        google.maps.event.addListener(myMap.instance, 'click', function(event) {
            Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        self.autorun(function () {
            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];

            var markerCursor = Markers.find({});

            markerCursor.forEach(function (marker) {

                markers.push(new google.maps.Marker({
                    position: new google.maps.LatLng(marker.lat, marker.lng),
                    map: myMap.instance,
                }));

            });
        });

    });
});
