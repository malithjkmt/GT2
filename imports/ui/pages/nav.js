import './nav.html';

Template.nav.helpers({

 

  DisplayName: function() {
    return Meteor.user().profile.name;
  },
  notificationCount: function(){
    return 4;  // should retrieve from notification Collection like, Notificatinos.find({userID = this._id})
  },
  getTownsmanID: function(){
    if(Meteor.user()){
      return Meteor.user()._id;
    }
  }


});

Template.nav.onRendered(function () {
  $('.button-collapse').sideNav({
    closeOnClick: true,
    menuWidth: 300, // Default is 240
  });
});