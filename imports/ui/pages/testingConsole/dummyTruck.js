import './dummyTruck.html';

var ZOOM_LEVEL = 10; // ideal zoom level for streets
var demoTruck;

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
    var self = this;
    GoogleMaps.ready('dummyMap', function(dummyMap) {
        console.log("Dummy map is ready!");

        var autoLocationUpdateMode = false //get this from a radio button..... or ... from dummy console view
        if(autoLocationUpdateMode){
            self.autorun(function () {
                latLng = Geolocation.latLng();
                if (!latLng){
                    return;
                }
                // ......
            });
        }

        google.maps.event.addListener(dummyMap.instance, 'click', function(event) {
            if(demoTruck){
                console.log('inside');
                console.log(demoTruck._id);
                Meteor.call('updateTruckLocation', demoTruck._id, event.latLng.lat(), event.latLng.lng());  // Error.... the DB isn't updating ??? y the Hell is that???

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
        console.log(demoTruck);
    }
});