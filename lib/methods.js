Meteor.methods({
    "makeAdmin":function(nic) {
        var townsman = Meteor.users.findOne({username:nic});
    
       Meteor.users.update({_id:townsman._id},
        {$set: { "profile.userType": "admin"}})
    },
    "findAdminID":function(){
        var adminID = Meteor.users.findOne({"profile.userType":'admin'})._id;
        console.log('admin ID is ' +adminID);
        return adminID;

    },
    "updateTruckLocation":function(truckID, lat, lng){
        Trucks.update({ _id: truckID},
            {
                $set: {
                    lat: lat,
                    lng: lng
                }
            }
        );
    }
});
