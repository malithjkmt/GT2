import './feedbackThreads.html';



import { Meteor } from 'meteor/meteor'

Template.feedbackThreads.helpers({
    messageThreads() {

        var myArray = Feedbacks.find({}, {sort: {timeStamp: -1}}).fetch();
        var distinctArray = _.uniq(myArray, false, function(d) {return d.townsmanID});
       // var disctinctValues = _.pluck(distinctArray, 'user');
      //  console.log(distinctArray);
        return distinctArray;


    },
    formatDate: function(date){
        return moment(date).format('MM-DD-YYYY');
    }

});



Template.messageThread.helpers({
    myUserID: function(){
        var myUserID = Meteor.user()._id;
        return myUserID;
    }
});




        Template.feedbackThreads.events({
    'click #thread'(event) {
        // Prevent default browser form submit
        console.log("clicked!!");
    }
});
