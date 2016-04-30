


import './feedback.html';

Template.feedback.helpers({
    messages() {
        if (Meteor.user()) {
            return Feedbacks.find({user: Meteor.user()._id});
        }
    },

});


