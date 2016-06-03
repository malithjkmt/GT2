import './subscribe.html';

var directionsDisplayArray = [];

var ZOOM_LEVEL = 5;
var count = 0;
var readyCount = 1;
var renderedCount = 1;
var routesCursor;
var routesArray = [];

Template.subscribe.helpers({

    routes: () =>{
        routesCursor = Routes.find({});
        return routesCursor;
    }

});
/*

 Template.subscribe.events({

 'click #test'(event) {
 // console.log(routesCursor.fetch()[20].mapRoute);
 Meteor.call('dl');
 }


 });
 */


Template.subscribe.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('routes');
});


Template.routeMap.helpers({
    geolocationError: ()=>{
        var error = Geolocation.error();
        return error && error.message;
    },
    myMapOptions: ()=> {

        if (GoogleMaps.loaded()) {

            // Map options
            var mapOptions = {
                zoom: ZOOM_LEVEL,
                center: new google.maps.LatLng(6.523693, 80.096866),
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
    },
    routes: ()=> {

        return Routes.find({});
    },
    index: ()=> {
        count++;
        return "map" + count;
    }


});

Template.routeMap.onCreated(()=> {

    var mapName = "map" + renderedCount;
    renderedCount++;
    console.log("map "+ mapName+" created");


    GoogleMaps.ready(mapName, map => {
        console.log("map map" + readyCount + " is ready");

        var display = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });

        var temp = JSON.parse(routesCursor.fetch()[readyCount - 1].mapRoute);
        display.setDirections(temp);

        directionsDisplayArray.push(display);

        readyCount++;
    });


});


function setZm(mapName) {
    /*console.log(mapName.instance.getZoom());
     mapName.instance.setZoom(15);*/


}