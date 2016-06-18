import './map.html';

var ZOOM_LEVEL = 10; // ideal zoom level for streets
var routeID;

Template.mapView.helpers({
    setRouteID: function(route_id){
        routeID = route_id;
        console.log(routeID);
    }

});

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
    this.state = new ReactiveDict();
    Meteor.subscribe('trucks');
    Meteor.subscribe('routes');

    var self = this;
    var markers = [];

    GoogleMaps.ready('myMap', function(map) {
        console.log("I'm ready!");

        //#############  draw the route on  map: begin
        var ren = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });


        var os = JSON.parse(Routes.findOne({_id:routeID}).mapRoute);
        console.log(os);

        ser = new google.maps.DirectionsService();

        var wp = [];
        for (var i = 0; i < os.waypoints.length; i++)
            wp[i] = {'location': new google.maps.LatLng(os.waypoints[i][0], os.waypoints[i][1]), 'stopover': false}

        ser.route({
            'origin': new google.maps.LatLng(os.start.lat, os.start.lng),
            'destination': new google.maps.LatLng(os.end.lat, os.end.lng),
            'waypoints': wp,
            'travelMode': google.maps.DirectionsTravelMode.DRIVING
        }, function (res, sts) {
            if (sts == 'OK')ren.setDirections(res);
        })
        //#############  draw the route on  map: end

        console.log('Route is drawin!');



        google.maps.event.addListener(map.instance, 'click', function(event) {
            Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        self.autorun(function () {

            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];

            //add current markers
            var TrucksFleet = Trucks.find({});
            TrucksFleet.forEach(function (truck) {
                markers.push(new google.maps.Marker({
                    position: new google.maps.LatLng(truck.lat, truck.lng),
                    map: map.instance,
                    title: truck.license
                }));

            });
            //above is a brute force adding of markers... only add the changed ones... how?
        });

    });
});
