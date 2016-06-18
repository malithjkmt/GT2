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
  },
  isAdmin:function () {
    if(Meteor.user() && Meteor.user().profile.userType == 'admin'){
      return true;
    }
    return false;
  },
  isTownsman:function () {
    if(Meteor.user() && Meteor.user().profile.userType == 'townsman'){
      return true;
    }
    return false;
  }


});

Template.nav.onRendered(function () {
  $('.button-collapse').sideNav({
    closeOnClick: true,
    menuWidth: 300, // Default is 240
  });
});