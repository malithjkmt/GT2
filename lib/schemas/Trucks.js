Schemas.Truck = new SimpleSchema({
    model: {
        // Labels are used to reffer to this field in validation
        label: 'Truck Model (tractor, tipper truck..) ',
        // Specifying the allowed type
        type: String
    },
    license: {
        label: 'Truck License Number',
        type: String
    },
    registerDate: {
        label: 'Truck Registered Date (to the Council)',
        type: Date,
        autoform: {
            type:"pickadate"
        }
    },
    lat:{
        type:String,
        autoValue:function(){ return '6.530941' }
    },
    lng:{
        type:String,
        autoValue:function(){ return '80.103390' }
    }
});
