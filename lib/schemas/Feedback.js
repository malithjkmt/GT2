
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'

Schemas.Feedback = new SimpleSchema({

    message: {
        label: 'message',
        type: String
    },
    adminID:{
        type:String,
        optional:true,
        autoform: {
            type: 'hidden'
        }
    },
    townsmanID:{
        type:String,
        optional:true,
        autoform: {
            type: 'hidden'
        }
    },

    userName:{
        type:String,
        optional:true,
        autoValue:function(){ return Meteor.user().profile.name},
    },

    timeStamp:{
        type: Date,
        autoValue:function(){ return new Date() },
    },
    from:{
        type:String,
        optional:true,
        autoform: {
            type: 'hidden'
        }
    },

});
