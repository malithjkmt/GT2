import './dummyTruck.html';

var ZOOM_LEVEL = 10; // ideal zoom level for streets
var demoTruck;
var self;
var myMarker;
var assignedRoute;
var fillColors = ['#FFFF99','#66FFFF', '#b30000', '#00b33c', '#ff4dd2','#FFFF99','#66FFFF',
    '#b30000', '#00b33c', '#ff4dd2','#FFFF99','#66FFFF', '#b30000', '#00b33c', '#ff4dd2',
    '#FFFF99','#66FFFF', '#b30000', '#00b33c', '#ff4dd2','#FFFF99','#66FFFF', '#b30000',
    '#00b33c', '#ff4dd2','#FFFF99','#66FFFF', '#b30000', '#00b33c', '#ff4dd2','#FFFF99',
    '#66FFFF', '#b30000', '#00b33c', '#ff4dd2','#FFFF99','#66FFFF', '#b30000', '#00b33c',
    '#ff4dd2','#FFFF99','#66FFFF', '#b30000', '#00b33c', '#ff4dd2'];  // make this a random generator......

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


Template.dummyMap.onCreated(function () {
    Meteor.subscribe('trucks');
    Meteor.subscribe('notifications')
    Meteor.subscribe('routes');
    Meteor.subscribe('allUsers')

    self = this;
    GoogleMaps.ready('dummyMap', function (dummyMap) {
        console.log("Dummy map is ready!");

        google.maps.event.addListener(dummyMap.instance, 'click', function (event) {
            if (demoTruck) {

                // if the user hasn't assign a marker
                if (!myMarker) {

                    myMarker = new google.maps.Marker({
                        position: {lat: event.latLng.lat(), lng: event.latLng.lng()},
                        map: dummyMap.instance,
                        title: "me",
                        draggable: true,
                        animation: google.maps.Animation.DROP

                    });
                }
                else {
                    myMarker.setPosition({lat: event.latLng.lat(), lng: event.latLng.lng()});
                }

                Meteor.call('updateTruckLocation', demoTruck._id, event.latLng.lat(), event.latLng.lng());
            }

        });

    });
});


Template.truckFinder.helpers({
    truckIDs: function () {
        return Trucks.find({}).fetch().map(function (it) {
            return it.license;
        });
    },
    routeIDs: function () {
        return Routes.find({}).fetch().map(function (it) {
            return it.TruckNO + ":" + it._id;
        });
    }


});

Template.truckFinder.rendered = function () {
    Meteor.typeahead.inject();
};

Template.dummyMapView.events({
    'click #demo'(event) {
        // Prevent default browser form submit
        event.preventDefault();
        var license = document.getElementById('truckID').value;
        demoTruck = Trucks.findOne({license: license});

        Meteor.call('setTruckOnDuty', demoTruck._id);

        GoogleMaps.ready('dummyMap', function (dummyMap) {



         //   truckNo = Trucks.findOne({_id: demoTruck._id}).license;
            // get the active route_id ( at the registering route section, it has make sure no truck will assigned to multiple active routes)
          //  assignedRoute = Routes.findOne({TruckNO: truckNo}, {active: true});
            var fullStr =  document.getElementById('RouteID').value;
            console.log(fullStr);

            var assignedRoute_id = fullStr.split(':')[1];
            console.log(assignedRoute_id);

            Meteor.call('setRouteActive', assignedRoute_id);

            console.log(assignedRoute_id);

            var notifications = Notifications.find({route_id: assignedRoute_id}).fetch();

            //#############  draw the route on  map: begin
            var ren = new google.maps.DirectionsRenderer({
                draggable: false,
                map: dummyMap.instance,
            });

            var os = JSON.parse(Routes.findOne({_id: assignedRoute_id}).mapRoute);
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
            });

            //#############  draw the route on  map: end
            var i = 0;
            // ############### draw notification circles on map: begin
            notifications.forEach(function (notification) {

                JSON.parse(notification.points).forEach(function (point) {
                    new google.maps.Circle({
                        strokeColor: '#000000',
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: fillColors[i],
                        fillOpacity: 0.35,
                        map: dummyMap.instance,
                        center: new google.maps.LatLng(point.lat, point.lng),
                        radius: 50,
                        clickable: false
                    })
                });
                i++;
            })
            // ############### draw notification circles on map: end


            // reactive part
            self.autorun(function () {

                // if auto mode on
                if (false) {
                    var latLng = Geolocation.latLng();

                    // update current location reactively
                    console.log("updating location" + latLng.lat);
                    if (latLng) {

                        // if the user hasn't assign a marker
                        if (!myMarker) {

                            myMarker = new google.maps.Marker({
                                position: latLng,
                                map: dummyMap.instance,
                                title: "me",
                                draggable: true,
                                animation: google.maps.Animation.DROP

                            });
                        }
                        else {
                            myMarker.setPosition(latLng);
                        }

                        Meteor.call('updateTruckLocation', demoTruck._id, latLng.lat, latLng.lng);
                    }
                }




                // when ever the DB changes the variable truck will also change, then the autorun() will be called
                var truck = Trucks.findOne({_id: demoTruck._id});

                notifications.forEach(function (notification) {
                    var notipoints = JSON.parse(notification.points);
                    notipoints.forEach(function (noti) {

                        // Check if truck has entered to a notification circle (point)
                        var range = distance(noti.lat, noti.lng, truck.lat, truck.lng);
                        if (range < 50) {
                            var notiUserLoc = Meteor.users.findOne({_id:notification.user_id}).profile.location;
                            console.log(notiUserLoc);

                            var distanceToTruck = Math.ceil(distance(notiUserLoc.lat, notiUserLoc.lng, truck.lat, truck.lng));   // get distance to user from the truck

                            console.log('inside noti cirlce!! user_id is ' + notification.user_id+ " range is "+ range +" distance is "+distanceToTruck);
                            Push.send({
                                from: 'Dummy',
                                title: 'Garbage Truck Tracker',
                                text: " distance is "+distanceToTruck + "m",
                                badge: 12,
                                query: {userId:notification.user_id}
                            });

                        }
                    })
                })



            });


        });


    }
});

function distance(lat1, lng1, lat2, lng2) {

    var R = 6371000; // metres ( radius of earth)
    var φ1 = lat1 * Math.PI / 180;
    var φ2 = lat2 * Math.PI / 180;
    var Δφ = (lat2 - lat1) * Math.PI / 180;
    var Δλ = (lng2 - lng1) * Math.PI / 180;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = R * c;
    return d;
}