import './nav.html';



Template.nav.rendered = function () {
  $(".button-collapse").sideNav({
    closeOnClick: true
  });
};

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