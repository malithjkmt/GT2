

import { Session } from 'meteor/session'
import './viewFeedback.html';





Template.viewFeedback.helpers({
    setOthersUserId: function(userID) {
       // TownsmanUserID = feedback;
        Session.set('othersUserId',userID);
    },
});


Template.adminLeaveFeedback.helpers({
    getOthersUserId: function() {
        // TownsmanUserID = feedback;
        return Session.get('othersUserId');
    },
    getOffset: function(){
        //if user is an admin, offset = '', else offset = 'offset-s6'
        return ' s6';
    }
});

