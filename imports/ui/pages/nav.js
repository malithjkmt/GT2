import './nav.html';

var navTitle = "Home";




Template.nav.events({

  'click #navSubscribe'(e) {
   document.getElementById("navTitle").innerHTML = "Subscribe";
  },
  'click #navAddRoute' (e){
    document.getElementById("navTitle").innerHTML  = "Add Route";
  }
});


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
  navTitle: function () {
    return navTitle;
  }

});

Template.nav.onRendered(function () {
  $('.button-collapse').sideNav({
    closeOnClick: true,
    menuWidth: 300, // Default is 240
  });
});