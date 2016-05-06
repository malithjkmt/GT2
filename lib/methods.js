Meteor.methods({
    "makeAdmin":function(nic) {
        var townsman = Meteor.users.findOne({username:nic});
    
       Meteor.users.update({_id:townsman._id},
        {$set: { "profile.userType": "admin"}})
    }
});
