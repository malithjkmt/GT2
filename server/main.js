import { Meteor } from 'meteor/meteor';


Meteor.startup(() => {
  // code to run on server at startup
    Accounts.onCreateUser(function(options, user) {
        options.profile['userType'] = 'townsman';
        options.profile['location'] = null;

        if (options.profile)
            user.profile = options.profile;
        return user;

    });

    
   
});
