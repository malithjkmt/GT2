import './setupNotifications.html';
var ZOOM_LEVEL = 15;
var routeID;
var userID;
var notiPoints = [];


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

Template.notiMap.onCreated(function() {
    this.state = new ReactiveDict();
    Meteor.subscribe('routes');


});


Template.notiMap.onRendered(()=> {


    console.log("notiMap created");

    GoogleMaps.ready('notiMap', map => {


        console.log(" notiMap is ready");

        var display = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });

        var temp = JSON.parse(Routes.findOne({_id: routeID}).mapRoute);
        display.setDirections(temp);

        google.maps.event.addListener(map.instance, 'click', function(event) {
            new google.maps.Marker({
                position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
                map: map.instance
            });
            notiPoints.push({lat:event.latLng.lat() , lng: event.latLng.lng()});
            console.log(notiPoints);

            var cityCircle = new google.maps.Circle({
                strokeColor: '#006699',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#00FFFF',
                fillOpacity: 0.35,
                map: map.instance,
                center: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
                radius:50
            });

        });


    });


});
