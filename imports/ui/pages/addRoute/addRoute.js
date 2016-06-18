import './addRoute.html';
import './addRouteDateTime.html';
import './addRouteTruckDriver.html';

var ZOOM_LEVEL = 15; // ideal zoom level for streets
var startingPoint;
var endingPoint;
var waypointsArray = [];
var startSelectingState = false;
var endSelectingState = false;
var addMarkerState;
var directionsDisplay;
var directionsService;
var drawingHistory = [];
var startingPointMarker = null;
var endingPointMarker = null;
var startPointSelected = false;
var endPointSelected = false


Template.addRouteTruckDriver.onCreated(function () {
    // Subscribe to DB
    Meteor.subscribe('trucks');
    Meteor.subscribe('drivers');
});


Template.addRouteMap.helpers({
    geolocationError: function () {
        var error = Geolocation.error();
        return error && error.message;
    },
    myMapOptions() {
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
        // Starting point
        if (startingPointMarker) {
            startingPointMarker.setMap(null);
        }
        startSelectingState = true;
        disableEnable(true);
    },
    'click #endingPoint'(event) {
        // Ending point
        if (endingPointMarker) {
            endingPointMarker.setMap(null);
        }

        endSelectingState = true;
        disableEnable(true);


    },
    // Add Marker
    'click #addMarker'(event) {
        addMarkerState = true;
        document.getElementById('addMarker').disabled = true;
    },
    // Undo marker
    'click #undo'(event) {
        // remove the current route from the history
        drawingHistory.pop();
        // get the previous route from the history and display it
        directionsDisplay.setDirections(drawingHistory.pop());

    },
    'click #next'(event) {
        Router.go('/addRouteDateTime');
    }


});

Template.addRouteDateTime.events({
    'click #next'(event){
        // get values from inputs
        var startTime = document.getElementById('startTime').value;
        var startDay = document.getElementById('startDay').value;
        Session.set('startTime', startTime);
        Session.set('startDay', startDay);


        if (startTime && startDay)
            Router.go('/addRouteTruckDriver');
    }
});

Template.addRouteDateTime.helpers({
    dayOptions(){
        return [
            {label: "Monday", value: 'Monday'},
            {label: "Tuesday", value: 'Tuesday'},
            {label: "Wednesday", value: 'Wednesday'},
            {label: "Thursday", value: 'Thursday'},
            {label: "Friday", value: 'Friday'},
            {label: "Saturday", value: 'Saturday'},
            {label: "Sunday", value: 'Sunday'}
        ];
    }
});

Template.addRouteTruckDriver.events({
    'click #addRoute'(event){

        var driverNIC = document.getElementById('driverNIC').value;
        var truckNO = document.getElementById('truckNO').value


        if (driverNIC && truckNO) {
            Meteor.call('occupyTime', Session.get('startTime'), Session.get('startDay'), driverNIC, truckNO);
        }
    },
    'click #addRouteBack'(event){
        Router.go('/addRouteDateTime');
    }
});

Template.addRouteTruckDriver.helpers({
    // return available driver names
    driversNames() {
        var startTime = Session.get('startTime');
        var startDay = Session.get('startDay');
        var startTimeEnd = '2011-04-11T'+startTime;

        var yu = new Date(startTimeEnd);
        yu.setHours( yu.getHours() + 3 );   //  this 3 is the time to travel the route + rest time
        startTimeEnd =  moment(yu).format('HH:mm');
        console.log('startTime= '+ startTime +", startTimeEnd= "+startTimeEnd);

        var drivers = Drivers.find().fetch();

        var options = [];
        var busyHours;

        drivers.forEach(function (driver) {
            var busy = false;
            if(driver.busyHours){ busyHours = JSON.parse(driver.busyHours);
                busyHours.forEach(function (item) {
                    if(item.day == startDay  ){
                        // console.log(item.startTime);
                        var time = '2011-04-11T'+item.startTime;
                        var tt =  moment(time).format('HH:mm');

                        if(tt > startTime && tt < startTimeEnd){
                            busy = true;
                            console.log('busy');
                        }
                    }
                });}

            if(!busy){
                options.push({label: driver.name, value: driver.nic});
            }

       });
        if(options.length == 0){
            options.push({label: "no available drivers for that date time", value: 4456});
        }
        return options;
    },
    // return available trucks
    truckNo() {

        var startTime = Session.get('startTime');
        var startDay = Session.get('startDay');
        var startTimeEnd = '2011-04-11T'+startTime;

        var yu = new Date(startTimeEnd);
        yu.setHours( yu.getHours() + 3 );   //  this 3 is the time to travel the route + rest time
        startTimeEnd =  moment(yu).format('HH:mm');
        console.log('startTime= '+ startTime +", startTimeEnd= "+startTimeEnd);

        var trucks = Trucks.find().fetch();

        var options = [];
        var busyHours;

        trucks.forEach(function (truck) {
            var busy = false;
            if(truck.busyHours){
                busyHours = JSON.parse(truck.busyHours);
                busyHours.forEach(function (item) {
                    if(item.day == startDay  ){
                        //  console.log(item.startTime);
                        var time = '2011-04-11T'+item.startTime;
                        var tt =  moment(time).format('HH:mm');

                        if(tt > startTime && tt < startTimeEnd){
                            busy = true;
                            console.log('busy');
                        }
                    }
                });
            }

            if(!busy){
                options.push({label: truck.license, value: truck.license});
            }

        });
        if(options.length == 0){
            options.push({label: "no available trucks for that date time", value: 4456});
        }
        return options;
    },
    get_completeRoute(){
        return Session.get('completeRoute');
    },
    get_startTime(){
        return Session.get('startTime');
    },
    get_startDay(){
        return Session.get('startDay');
    }
})

Template.addRouteMap.onCreated(function () {

    // Run only after Google API loaded
    GoogleMaps.ready('addRouteMap', function (addRouteMap) {
        console.log("I'm ready!");

        // set default points
        startingPoint = new google.maps.LatLng(6.522755, 80.114548);
        endingPoint = new google.maps.LatLng(6.593758, 79.958979);


        google.maps.event.addListener(addRouteMap.instance, 'click', function (event) {


            if (startSelectingState) {
                startingPointMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
                    map: addRouteMap.instance,
                    title: 'Starting Point',
                    label: 'S'

                });
                startingPoint = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
                disableEnable(false);

                startPointSelected = true;
                startSelectingState = false;
                if (startPointSelected && endPointSelected) {
                    generateRoute();
                }
            }
            else if (endSelectingState) {
                endingPointMarker = new google.maps.Marker({
                    position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
                    map: addRouteMap.instance,
                    title: 'Ending Point',
                    label: 'E'
                });
                endingPoint = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
                disableEnable(false);

                endPointSelected = true;
                endSelectingState = false;

                if (startPointSelected && endPointSelected) {
                    generateRoute();


                }
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

// ge the route path from Google API
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
            // fx(response.routes[0]);
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

}

// add route direction arrows
function fx(o) {
    if (o && o.legs) {
        for (l = 0; l < o.legs.length; ++l) {
            var leg = o.legs[l];
            for (var s = 0; s < leg.steps.length; ++s) {
                var step = leg.steps[s],
                    a = (step.lat_lngs.length) ? step.lat_lngs[0] : step.start_point,
                    z = (step.lat_lngs.length) ? step.lat_lngs[1] : step.end_point,

                    dir = ((Math.atan2(z.lng() - a.lng(), z.lat() - a.lat()) * 180) / Math.PI) + 360,
                    ico = ((dir - (dir % 3)) % 120);
                new google.maps.Marker({
                    position: a,
                    icon: new google.maps.MarkerImage('http://maps.google.com/mapfiles/dir_' + ico + '.png',

                        new google.maps.Size(24, 24),
                        new google.maps.Point(0, 0),
                        new google.maps.Point(12, 12),
                    ),
                    map: GoogleMaps.maps['addRouteMap'].instance,
                    title: Math.round((dir > 360) ? dir - 360 : dir) + '°'
                });

            }
        }
    }
}

// genereate route according to the selected start and end points
function generateRoute() {

    if (startingPointMarker) {
        startingPointMarker.setMap(null);
    }
    if (endingPointMarker) {
        endingPointMarker.setMap(null);
    }

    GoogleMaps.ready('addRouteMap', function (addRouteMap) {
        // clear previous values if..

        directionsService = new google.maps.DirectionsService; //ser
        directionsDisplay = new google.maps.DirectionsRenderer({   //ren
            draggable: true,
            map: addRouteMap.instance,
            panel: document.getElementById('right-panel')
        });


        directionsDisplay.addListener('directions_changed', function () {
            computeTotalDistance(directionsDisplay.getDirections());
            var temp = directionsDisplay.getDirections();
            drawingHistory.push(temp);

            var data = {};
            var w = [];
            var wp = [];

            var route = directionsDisplay.directions.routes[0];

            console.log(route);

            data.start = {'lat': route.legs[0].start_location.lat(), 'lng': route.legs[0].start_location.lng()};

            var j;
            for (j = 0; j < directionsDisplay.directions.routes[0].legs.length; j++) {

                wp = directionsDisplay.directions.routes[0].legs[j].via_waypoints;
                for (var i = 0; i < wp.length; i++) {
                    w.push([wp[i].lat(), wp[i].lng()]);
                }
                w.push([route.legs[j].end_location.lat(), route.legs[j].end_location.lng()]);
            }
            w.pop();
            data.end = {'lat': route.legs[j - 1].end_location.lat(), 'lng': route.legs[j - 1].end_location.lng()};


            data.waypoints = w;

            console.log(data);
            var str = JSON.stringify(data)


            // here I pass stringified JSON object to the mongo Collection.
            // So when using it first parse
            // eg:- console.log(JSON.parse(document.getElementById('routeMap').value));

            // document.getElementById('routeMap').value = str;
            completeRoute = str;
            Session.set('completeRoute', str);


            // fx(temp.routes[0]);
            if (drawingHistory.length < 2) {
                document.getElementById('undo').disabled = true;
            }
            else {
                document.getElementById('undo').disabled = false;
            }

        });

        displayRoute(startingPoint, endingPoint, directionsService,
            directionsDisplay);

    })


    var parent = document.getElementById("parentAddButtons");
    var child = document.getElementById("addRouteButtons1");
    parent.removeChild(child);


    document.getElementById('addRouteButtons2').style.visibility = 'visible';
    document.getElementById('addRouteButtons2').style.height = 'auto';

    document.getElementById('navigationDetails').style.visibility = 'visible';
    document.getElementById('navigationDetails').style.height = 'auto';


    document.getElementById('undo').disabled = true;


}