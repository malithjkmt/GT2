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
        event.preventDefault();
        var nicDOM =  document.getElementById('userID').value;
        console.log(nicDOM);
        Meteor.call('makeAdmin',nicDOM);
    }
});