import './dummyTruck.html';

var ZOOM_LEVEL = 10; // ideal zoom level for streets
var demoTruck;
var self;
var myMarker;

Template.dummyMap.helpers({
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


Template.dummyMap.onCreated(function() {
    self = this;
    GoogleMaps.ready('dummyMap', function(dummyMap) {
        console.log("Dummy map is ready!");

        google.maps.event.addListener(dummyMap.instance, 'click', function(event) {
            if(demoTruck){
                myMarker.setPosition({lat:event.latLng.lat(), lng:event.latLng.lng()});
                Meteor.call('updateTruckLocation', demoTruck._id, event.latLng.lat(), event.latLng.lng());
            }

        });

    });
});


Template.truckFinder.helpers({
    truckIDs: function() {
        return Trucks.find({}).fetch().map(function(it){ return it.license; });
    }
});

Template.truckFinder.rendered = function() {
    Meteor.typeahead.inject();
};

Template.dummyMapView.events({
    'click #demo'(event) {
        // Prevent default browser form submit
        event.preventDefault();
        var license = document.getElementById('truckID').value;
        demoTruck = Trucks.findOne({license:license});


        GoogleMaps.ready('dummyMap', function(dummyMap) {
            self.autorun(function () {
                var latLng = Geolocation.latLng();
                console.log("updating location" + latLng.lat);
                if (latLng) {

                    // if the user hasn't assign a marker
                    if(!myMarker) {

                        myMarker = new google.maps.Marker({
                            position: latLng,
                            map: dummyMap.instance,
                            title: "me",
                            animation: google.maps.Animation.DROP

                        });
                    }
                    else{
                        myMarker.setPosition(latLng);
                    }

                    Meteor.call('updateTruckLocation', demoTruck._id, latLng.lat, latLng.lng);
                }
            });



        });


    }
});