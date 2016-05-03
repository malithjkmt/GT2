import './createAdmin.html';


Template.createAdmin.helpers({
    userIDs: function() {


        return Meteor.users.find().fetch().map(function(it){ return it.username; });
    }
});

Template.createAdmin.rendered = function() {
    Meteor.typeahead.inject();
};


Template.createAdmin.events({
    'click #makeAdmin'(event) {
        // Prevent default browser form submit
        console.log("clicked!!");
        Meteor.call('test',"111111111");
    }
});