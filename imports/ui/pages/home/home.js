import './home.html';


var ZOOM_LEVEL = 5;
var count = 0;
var readyCount = 1;
var titleCount = 1;
var renderedCount = 1;
var routesCursor = [];
var routesArray = [];



Template.home.onCreated(function () {
    Meteor.subscribe('trucks');
    Meteor.subscribe('routes');
    Meteor.subscribe('notifications');
});

Template.home.helpers({
    subscribedRoutes: function () {

        routesCursor = [];

        if(Meteor.user()){
            var notificationCursor = Notifications.find({user_id: Meteor.user()._id});
            notificationCursor.forEach(function (notification) {
                routesCursor.push(Routes.findOne({_id: notification.route_id}));
            });
        }

      
        return routesCursor;
    },
    resetCounters(){
        count = 0;
        readyCount = 1;
        renderedCount = 1;
        titleCount = 0;
    }

});


Template.MyrouteMap.helpers({
    geolocationError: ()=> {
        var error = Geolocation.error();
        return error && error.message;
    },
    myMapOptions(){
        count--;  // if  we can't go inside the if block below, balance the count. Because index function is called from the template already
        if (GoogleMaps.loaded()) {
            count++;  // balance count
            // Map options
            var mapOptions = {
                zoom: ZOOM_LEVEL,
                center: new google.maps.LatLng(6.523693, 80.096866),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,

                // map controls
                zoomControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false,

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
    },
    index(){
        count++;
        return "myMap" + count;
    }


});


Template.MyrouteMap.onRendered(()=> {


    var mapName = "myMap" + renderedCount;
    renderedCount++;
    console.log("map " + mapName + " created");


    GoogleMaps.ready(mapName, function (map) {

        console.log("map map " + mapName + " is refady");

        //#############  draw the route on  map: begin
        var ren = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });
       
        var os = JSON.parse(routesCursor[mapName.substring(5, 6) - 1].mapRoute);
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


    });


});
