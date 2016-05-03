Meteor.methods({
    "test":function(nic) {
        //should print the user details if logged in, undefined otherwise.
        console.log("test passed!!");
        var townsman = Meteor.users.findOne({username:nic});
        console.log(townsman);
        console.log(townsman._id);



       Meteor.users.update({_id:townsman._id},
        {$set: { username: "999999999" }})
        console.log(Meteor.users.findOne({_id:townsman._id}));
    }
});
