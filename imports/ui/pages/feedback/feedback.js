

import { Session } from 'meteor/session'
import './feedback.html';


Template.leaveFeedback.helpers({
    getAdminID: function() {

        return Session.get('adminID');
    },
    getTownsmanID: function() {

        return Session.get('townsmanID');
    },
    getUserType: function () {
        if(Meteor.user()) {
            var type = Meteor.user().profile.userType;
        }
        return type;  
    },

});

Template.messageT.helpers({
    renderOffset: function (from) {
        if(Meteor.user()) {
            if (from == Meteor.user().profile.userType) { // >>> from == Meteor.user().type (current user's type)
                return 'offset-s6';
            }
            else {
                return ' ';
            }
        }
        return '';
    }
});



