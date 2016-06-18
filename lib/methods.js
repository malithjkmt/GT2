Push.debug = true;

Push.allow({
    send: function (userId, notification) {
        return true; // Allow all users to send
    }
});


Meteor.methods({
    "makeAdmin": function (nic) {
        var townsman = Meteor.users.findOne({username: nic});

        Meteor.users.update({_id: townsman._id},
            {$set: {"profile.userType": "admin"}})
    },
    "findAdminID": function () {
        var adminID = Meteor.users.findOne({"profile.userType": 'admin'})._id;
        console.log('admin ID is ' + adminID);
        return adminID;

    },
    "updateTruckLocation": function (truckID, lat, lng) {
        Trucks.update({_id: truckID},
            {
                $set: {
                    lat: lat,
                    lng: lng
                }
            }
        );
        console.log("DB Truck " + truckID + " location updated");
    },
    "dlNoti": function () {
        Notifications.remove({});
    },
    "dlDrivers": function () {
        Drivers.remove({});
    },
    "dlRoutes": function () {
        Routes.remove({});
    },
    "dlTrucks": function () {
        Trucks.remove({});
    },
    "saveNoti": function (notiPoints, route_id, user_id) {
        console.log(notiPoints);
        Notifications.insert({'points': notiPoints, 'user_id': user_id, 'route_id': route_id});

    },
    "setTruckOnDuty": function (truck_id) {
        Trucks.update({_id: truck_id},
            {
                $set: {
                    onDuty: true
                }
            }
        );
        console.log("DB Truck " + truck_id + " set OnDuty true");
    },
    "setRouteActive": function (route_id) {
        Routes.update({_id: route_id},
            {
                $set: {
                    active: true
                }
            }
        );
        console.log("DB Truck " + route_id + " set active true");
    },
    "updateMyLocation": function (user_id, pos) {
        Meteor.users.update({_id: user_id},
            {$set: {"profile.location": pos}})
    },
    "serverNotification": function (text, title) {
        var badge = 1;
        Push.send({
            from: 'push',
            title: title,
            text: text,
            badge: badge,
            query: {
                // this will send to all users
            }
        });
    },
    "occupyTime": function (startTime, day, driverNIC, truckNO) {
        console.log(driverNIC);
        console.log(truckNO);
        console.log(startTime);
        console.log(day);

        // make new JSON object
        var newBusyHours = {'day': day, 'startTime': startTime};

        // set driver's busy time
        var driver = Drivers.findOne({nic: driverNIC});

        // get current busy hours if available
        var currentBusyHours = driver.busyHours;

        if (currentBusyHours) {

            var str = JSON.parse(currentBusyHours);
            str.push(newBusyHours);

            Drivers.update({nic: driverNIC},
                {
                    $set: {
                        busyHours: JSON.stringify(str)
                    }
                }
            );
        }
        else {
            Drivers.update({nic: driverNIC},
                {
                    $set: {
                        busyHours: '['+JSON.stringify(newBusyHours)+']'
                    }
                }
            );
        }


        // set truck's busy time
        var truck = Trucks.findOne({license: truckNO});
        console.log(truck);

        // get current busy hours if available
        var currentBusyHours = truck.busyHours;

        if (currentBusyHours) {
            var str = JSON.parse(currentBusyHours);
            str.push(newBusyHours);

            Trucks.update({license: truckNO},
                {
                    $set: {
                        busyHours: JSON.stringify(str)
                    }
                }
            );
        }
        else {
            Trucks.update({license: truckNO},
                {
                    $set: {
                        busyHours: '['+JSON.stringify(newBusyHours)+']'
                    }
                }
            );
        }



    }

});


