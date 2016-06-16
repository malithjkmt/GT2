import './setupNotifications.html';
var ZOOM_LEVEL = 15;
var routeID;
var userID;
var notiCircles = [];
var notiPoints = [];


Template.setupNotifications.onCreated(function() {
    Meteor.subscribe('notifications');
});

Template.setupNotifications.helpers({
    saveRoute_id(id){
        routeID = id;
    },
    saveUser_id(id){
        userID = id;
    }

});

Template.notiMap.helpers({
    geolocationError(){
        var error = Geolocation.error();
        return error && error.message;
    },
    myMapOptions(){

        if (GoogleMaps.loaded()) {

            // Map options
            var mapOptions = {
                zoom: ZOOM_LEVEL,
                center: new google.maps.LatLng(6.523693, 80.096866),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,

                // map controls
                zoomControl: true,
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
    },
});

Template.notiMap.onCreated(function () {
    this.state = new ReactiveDict();
    Meteor.subscribe('routes');


});


Template.notiMap.onRendered(()=> {

    document.getElementById('undo').disabled = true;

    console.log("notiMap created");

    GoogleMaps.ready('notiMap', map => {


        console.log(" notiMap is ready");

        //#############  draw the route on  map: begin
        var ren = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });

        var os = JSON.parse(Routes.findOne({_id: routeID}).mapRoute);
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

        google.maps.event.addListener(map.instance, 'click', function (event) {

            notiPoints.push({'lat':event.latLng.lat(), 'lng':event.latLng.lng()});

            notiCircles.push(new google.maps.Circle({
                strokeColor: '#006699',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#66FFFF',
                fillOpacity: 0.35,
                map: map.instance,
                center: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
                radius: 50
            }));
            document.getElementById('undo').disabled = false;

        });


    });


});

Template.setupNotifications.events({
    'click #undo'(event) {
        if (notiCircles.length > 0) {
            notiCircles.pop().setMap(null);
            if (notiCircles.length == 0) {
                document.getElementById('undo').disabled = true;
            }

        }

        if (notiPoints.length > 0) {
            notiPoints.pop();
        }


    },
    'click #save'(event) {

        console.log(notiPoints);
        Meteor.call('saveNoti', JSON.stringify(notiPoints), routeID, userID);
        notiPoints = null;
        notiPoints =[];
    }

});