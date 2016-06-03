
import './registerTruck.html';
import './updateTruck.html';
import './viewTrucks.html';


Template.viewTrucks.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('trucks');
});


Template.viewTrucks.helpers({
    trucks() {
        return Trucks.find({});
    },
});

Template.registerHelper('formatDate', function(timeStamp) {
    var currentTime = new Date();
    var currentDate = moment(currentTime).format('MM-DD-YYYY');

    var timeStampDate =  moment(timeStamp).format('MM-DD-YYYY');
    var timeStampTime =  moment(timeStamp).format('h:mm a');
    
    if(currentDate == timeStampDate){
        return timeStampTime;
    }
    else{
        return timeStampDate;
    }


});