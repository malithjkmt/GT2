
import '../../lib/methods.js';

Schemas.Feedback = new SimpleSchema({

    message: {
        label: 'message',
        type: String
    },
    offset:{
        defaultValue:'s6 offset-s6',
        type:String
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
