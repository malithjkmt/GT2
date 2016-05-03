import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
    Accounts.onCreateUser(function(options, user) {
        options.profile['userType'] = 'townsman';
        console.log(options);
        return user;
    });

    
   
});
