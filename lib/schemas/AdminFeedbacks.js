
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'

Schemas.AdminFeedback = new SimpleSchema({

    message: {
        label: 'message',
        type: String
    },
    offset:{
        type:String,
        optional:true,
        autoform: {
            type: 'hidden'
        }
    },
        otherUser:{
            type:String,
            autoform: {
                type: 'hidden'
            }
    },
    user:{
        type:String,
        autoValue:function(){ return this.userId },
    },

    userName:{
        type:String,
        autoValue:function(){ return Meteor.user().profile.name},
    },

    timeStamp:{
        type: Date,
        autoValue:function(){ return new Date() },
    }
});
