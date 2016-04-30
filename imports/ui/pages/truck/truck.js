
import './registerTruck.html';
import './updateTruck.html';
import './viewTrucks.html';

Template.viewTrucks.helpers({
    trucks() {
        return Trucks.find({});
    },
});

Template.registerHelper('formatDate', function(date) {
    return moment(date).format('MM-DD-YYYY');
});