
import './registerDriver.html';
import './updateDriver.html';
import './viewDrivers.html';


Template.viewDrivers.helpers({
    drivers() {
        return Drivers.find({});
    }
});
