import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './subscribe.html';

var directionsDisplayArray = [];

var ZOOM_LEVEL = 5;
var count = 0;
var readyCount = 1;
var titleCount = 1;
var renderedCount = 1;
var routesCursor;
var routesArray = [];

Template.subscribe.helpers({

    routes: () =>{
        routesCursor = Routes.find({});
        return routesCursor;
    },
    resetCounters(){
        count = 0;
        readyCount = 1;
        renderedCount = 1;
        titleCount=0;
    },
    title(){
        return ++titleCount;
    }

});

 Template.subscribe.events({
 'click .subscribeRoute'(event) {
     console.log(event.target);

 }
 });



Template.subscribe.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('routes');
});


Template.routeMap.helpers({
    geolocationError: ()=>{
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
    routes: ()=> {

        return Routes.find({});
    },
    index(){
        count++;
        return "map" + count;
    }


});



Template.routeMap.onRendered(()=> {


    var mapName = "map" + renderedCount;
    renderedCount++;
    console.log("map "+ mapName+" created");


    GoogleMaps.ready(mapName, map => {

        console.log("map map" + mapName + " is ready");

        var display = new google.maps.DirectionsRenderer({
            draggable: false,
            map: map.instance,
        });

        var temp = JSON.parse(routesCursor.fetch()[mapName.substring(3,4) - 1].mapRoute);
        display.setDirections(temp);

        directionsDisplayArray.push(display);
    });


});


function setZm(mapName) {
    /*console.log(mapName.instance.getZoom());
     mapName.instance.setZoom(15);*/


}