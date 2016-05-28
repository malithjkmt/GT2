import './addRoute.html';

var ZOOM_LEVEL = 15; // ideal zoom level for streets
var startingPoint;
var endingPoint;
var waypointsArray = [];
var startSelectingState = false;
var endSelectingState = false;
var addMarkerState;
var directionsDisplay;
var directionsService;
var backupResponse;
var drawingHistory = [];
var r;

Template.addRouteMap.helpers({
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

Template.addRouteMap.events({
    'click #startingPoint'(event) {
        startSelectingState = true;
        disableEnable(true);
    },
    'click #endingPoint'(event) {
        endSelectingState = true;
        disableEnable(true);


    },
    'click #addMarker'(event) {
        addMarkerState = true;
        document.getElementById('addMarker').disabled = true;
    },
    'click #roughRoute'(event) {

        GoogleMaps.ready('addRouteMap', function (addRouteMap) {
            // clear previous values if..

            directionsService = new google.maps.DirectionsService;
            directionsDisplay = new google.maps.DirectionsRenderer({
                draggable: true,
                map: addRouteMap.instance,
                panel: document.getElementById('right-panel')
            });


            directionsDisplay.addListener('directions_changed', function () {
                computeTotalDistance(directionsDisplay.getDirections());
                var temp = directionsDisplay.directions;
                drawingHistory.push(temp);

                if(drawingHistory.length <2){
                    document.getElementById('undo').disabled = true;
                }
                else{
                    document.getElementById('undo').disabled = false;
                }

            });

            displayRoute(startingPoint, endingPoint, directionsService,
                directionsDisplay);

        })


        document.getElementById('addRouteButtons1').style.visibility = 'hidden';
        document.getElementById('addRouteButtons1').style.height = 0;

        document.getElementById('addRouteButtons2').style.visibility = 'visible';

        document.getElementById('undo').disabled = true;


    },
    'click #undo'(event) {
        // window.location.reload()
        
        // remove the current route from the history
        drawingHistory.pop();
        // get the previous route from the history and display it
        directionsDisplay.setDirections(drawingHistory.pop());

    },
    'click #saveRoute'(event) {
        // console.log(backupResponse);
        //  console.log(directionsDisplay);
        // backupResponse = directionsDisplay.directions;
        console.log(drawingHistory);
    }

});

Template.addRouteMap.onCreated(function () {


    GoogleMaps.ready('addRouteMap', function (addRouteMap) {
        console.log("I'm ready!");

        // set default points
        startingPoint = new google.maps.LatLng(6.522755, 80.114548);
        endingPoint = new google.maps.LatLng(6.593758, 79.958979);

        google.maps.event.addListener(addRouteMap.instance, 'click', function (event) {
            if (startSelectingState) {
                startingPoint = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
                startSelectingState = false;
                disableEnable(false);
            }
            else if (endSelectingState) {
                endingPoint = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
                endSelectingState = false;
                disableEnable(false);
            }
            else if (addMarkerState) {
                waypointsArray.push({location: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng())});
                console.log(waypointsArray);
                displayRoute(startingPoint, endingPoint, directionsService,
                    directionsDisplay);
                addMarkerState = false;
                document.getElementById('addMarker').disabled = false;
            }


        });


    });
});

function displayRoute(origin, destination, service, display) {
    service.route({
        origin: origin,
        destination: destination,
        waypoints: waypointsArray,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
        avoidHighways: true,
        region: 'LK',
        provideRouteAlternatives: false,
        unitSystem: google.maps.UnitSystem.METRIC

    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            display.setDirections(response);
        } else {
            alert('Could not display directions due to: ' + status);
        }
    });
}

function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    document.getElementById('total').innerHTML = total + ' km';
}

function disableEnable(value) {
    document.getElementById('startingPoint').disabled = value;
    document.getElementById('endingPoint').disabled = value;
    document.getElementById('addMarker').disabled = value;
    document.getElementById('roughRoute').disabled = value;

}