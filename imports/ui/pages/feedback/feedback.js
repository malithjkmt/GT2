

import { Session } from 'meteor/session'
import './feedback.html';


Template.leaveFeedback.helpers({
    getAdminID: function() {

        return Session.get('adminID');
    },
    getTownsmanID: function() {

        return Session.get('townsmanID');
    },
    getOffset: function(){
        //if user is an admin, offset = '', else offset = 'offset-s6'
        return 'offset-s6 ';
    },
    getUserType: function () {
        return 'admin';  // Meteor.user().type (current user's type)
    },

});



Template.messageT.helpers({
    renderOffset: function (from) {
        if (true) { // >>> from == Meteor.user().type (current user's type)
            return 'offset-s6';
        }
        else {
            return ' ';
        }
    }
});



