
import './home.html';

Template.home.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('trucks');
});

Template.home.helpers({
    truck: ()=> Trucks.findOne({_id:'67u5WEKKo4GCSaaQS'}),

});