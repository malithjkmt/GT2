
import './registerTruck.html';
import './updateTruck.html';
import './viewTrucks.html';

Template.viewTrucks.helpers({
    trucks() {
        return Trucks.find({});
    },
});