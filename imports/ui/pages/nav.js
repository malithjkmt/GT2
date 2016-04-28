import './nav.html';

Template.nav.rendered = function () {
  $(".button-collapse").sideNav();
};

Template.nav.helpers({
  DisplayName: function() {
    return Meteor.user().profile.name;
  }
});